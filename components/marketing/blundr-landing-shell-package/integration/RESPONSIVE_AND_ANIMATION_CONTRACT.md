# Responsive and animation contract

Header: sticky dark-green bar; desktop nav at 841px and above; mobile menu below 840px; Escape and anchor selection close the menu.

Hero: two-column desktop, stacked below 980px, full-bleed board stage on mobile. Tempo breathes and blinks continuously while the component is mounted; pointer movement updates its position. The canvas uses `ResizeObserver` and `IntersectionObserver` cleanup; reduce motion disables animation.

Momentum: reward count animates 0→10 in 1.5 seconds, repeats on a 7.5-second local cycle, and shows Collected after the reward settles. Reduced motion renders 10 pts and Collected immediately.

Pricing: responsive two-column cards stack below 720px. No animation or product state is required.

Final CTA/Footer: responsive stacking below 620px; hover/focus states inherit the shared marketing button/link styles.

No section calls Supabase, authentication, Maia, Stripe, RevenueCat, billing, entitlements, or product training APIs. Existing five demo components retain their own deterministic observer/timer cleanup contracts.
