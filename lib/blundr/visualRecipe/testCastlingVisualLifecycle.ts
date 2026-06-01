import { testAnimationEndStatePersistence } from "../animation/__tests__/animationEndStatePersistence.test";
import { testCastlingVisualRecipe } from "./__tests__/castlingVisualRecipe.test";
import { testVisualFenNormalization } from "./__tests__/visualFenNormalization.test";

export function testCastlingVisualLifecycle(): void {
  testCastlingVisualRecipe();
  testAnimationEndStatePersistence();
  testVisualFenNormalization();
}
