import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BLUNDR_REWARD_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT } from "@/lib/blundr/rewards/rewardPresentationSignal";
import { buildRewardPresentationViewModel, type RewardPresentation } from "../rewardPresentationViewModel";

const route = vi.hoisted(() => ({ pathname: "/" }));
const api = vi.hoisted(() => ({ fetch: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

vi.mock("@/lib/blundr/api/authenticatedApiClient", () => ({
  authenticatedApiFetch: api.fetch,
}));

import { RewardPresentationHost } from "../RewardPresentationHost";

const commonPresentation: RewardPresentation = {
  id: "presentation-common",
  presentation_kind: "toast",
  presentation_key: "completion:all-rings",
  envelope: {
    quantity: 5,
    rewardGrants: [{ rarity: "common", rewardType: "unlock_points", amount: 5 }],
  },
};

function mockClaimQueue(presentations: Array<RewardPresentation | null>) {
  api.fetch.mockImplementation((url: string, init?: RequestInit) => {
    if (url.includes("/presentations/claim")) {
      return Promise.resolve({ data: presentations.shift() ?? null });
    }
    if (url.includes("/presentations/state")) {
      return Promise.resolve({
        ok: true,
        data: JSON.parse(String(init?.body ?? "{}")),
      });
    }
    throw new Error(`unexpected url: ${url}`);
  });
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function stateActions() {
  return api.fetch.mock.calls
    .filter(([url]) => String(url).includes("/presentations/state"))
    .map(([, init]) => JSON.parse(String((init as RequestInit | undefined)?.body ?? "{}")).action);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED", "true");
  route.pathname = "/";
  api.fetch.mockReset();
  window.sessionStorage.clear();
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: () => "test-client" },
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("RewardPresentationHost lifecycle", () => {
  it.each(["/train", "/review", "/daily"])(
    "does not claim or show queued rewards away from Home on %s",
    async (pathname) => {
      route.pathname = pathname;
      mockClaimQueue([commonPresentation]);
      render(<RewardPresentationHost />);
      window.dispatchEvent(new Event(BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT));
      await advance(2_500);
      expect(api.fetch).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
  );

  it("waits two seconds on Home before claiming and rendering a reward", async () => {
    mockClaimQueue([commonPresentation]);
    render(<RewardPresentationHost />);
    await advance(1_999);
    expect(api.fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await advance(1);
    expect(api.fetch).toHaveBeenCalledWith(
      "/api/blundr/rewards/presentations/claim",
      expect.objectContaining({ method: "POST" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collect" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    expect(stateActions()).toEqual(["rendered"]);
  });

  it("cancels the Home timer when the user leaves, then starts a fresh delay on return", async () => {
    mockClaimQueue([commonPresentation]);
    const view = render(<RewardPresentationHost />);
    await advance(1_000);
    route.pathname = "/train";
    view.rerender(<RewardPresentationHost />);
    await advance(2_000);
    expect(api.fetch).not.toHaveBeenCalled();

    route.pathname = "/";
    view.rerender(<RewardPresentationHost />);
    await advance(1_999);
    expect(api.fetch).not.toHaveBeenCalled();
    await advance(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Collect acknowledges only the leased presentation, closes it, and does not chain another popup", async () => {
    mockClaimQueue([
      commonPresentation,
      {
        id: "presentation-rare",
        envelope: {
          rewardGrants: [{ rarity: "rare", rewardType: "opening_fragment", amount: 1 }],
        },
      },
    ]);
    render(<RewardPresentationHost />);
    await advance(2_000);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Collect" }));
      await Promise.resolve();
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(stateActions()).toEqual(["rendered", "acknowledged"]);
    await advance(5_000);
    expect(api.fetch.mock.calls.filter(([url]) => String(url).includes("/presentations/claim"))).toHaveLength(1);
  });

  it("backdrop, Escape, and navigation do not acknowledge or dismiss the reward", async () => {
    mockClaimQueue([commonPresentation]);
    const view = render(<RewardPresentationHost />);
    await advance(2_000);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("reward-presentation-backdrop"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(stateActions()).toEqual(["rendered"]);
    route.pathname = "/review";
    view.rerender(<RewardPresentationHost />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(stateActions()).toEqual(["rendered"]);
  });
});

describe("reward presentation artwork and copy", () => {
  it("maps common rewards to common art with the actual point value", () => {
    const model = buildRewardPresentationViewModel(commonPresentation);
    expect(model.asset).toBe(BLUNDR_REWARD_ASSETS.commonReward);
    expect(model.title).toBe("Reward earned");
    expect(model.body).toBe("+5 repertoire points");
  });

  it("maps uncommon and rare grants to rare art without inventing quantities", () => {
    const model = buildRewardPresentationViewModel({
      id: "presentation-rare",
      envelope: {
        rewardGrants: [{ rarity: "uncommon", rewardType: "opening_fragment", amount: 1 }],
      },
    });
    expect(model.asset).toBe(BLUNDR_REWARD_ASSETS.rareReward);
    expect(model.title).toBe("Uncommon reward");
    expect(model.body).toBe("Opening Fragment earned");
  });

  it("maps epic point grants to epic art", () => {
    const model = buildRewardPresentationViewModel({
      id: "presentation-epic",
      envelope: {
        rewardGrants: [{ rarity: "epic", rewardType: "unlock_points", amount: 100 }],
      },
    });
    expect(model.asset).toBe(BLUNDR_REWARD_ASSETS.epicReward);
    expect(model.title).toBe("Epic reward");
    expect(model.body).toBe("+100 repertoire points");
  });

  it("maps opening unlocks to opening art", () => {
    const model = buildRewardPresentationViewModel({
      id: "presentation-opening",
      presentation_kind: "modal",
      envelope: { openingId: "italian-game" },
    });
    expect(model.asset).toBe(BLUNDR_REWARD_ASSETS.openingUnlocked);
    expect(model.title).toBe("Opening unlocked");
    expect(model.body).toBe("Italian Game is ready to train.");
  });

  it("maps streak-oriented presentations to streak art", () => {
    const model = buildRewardPresentationViewModel({
      id: "presentation-streak",
      presentation_key: "weekly-cache:test",
      envelope: { streakDays: 7 },
    });
    expect(model.asset).toBe(BLUNDR_REWARD_ASSETS.streakReward);
    expect(model.title).toBe("7-day streak");
    expect(model.body).toBe("Your consistency paid off.");
  });

  it("maps generic all-rings completion to all-rings art", () => {
    const model = buildRewardPresentationViewModel({
      id: "presentation-rings",
      presentation_key: "completion:all-rings",
      envelope: { quantity: 10 },
    });
    expect(model.asset).toBe(BLUNDR_REWARD_ASSETS.allRingsComplete);
    expect(model.body).toBe("+10 repertoire points");
  });
});
