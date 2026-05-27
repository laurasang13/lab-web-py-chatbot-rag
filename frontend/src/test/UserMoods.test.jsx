import { renderHook, act } from "@testing-library/react";
import { useUserMoods } from "../hooks/useUserMoods";

beforeEach(() => {
  global.localStorage = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
});

test("should add a mood", () => {
  const { result } = renderHook(() => useUserMoods());

  act(() => {
    result.current.addMood({ name: "happy" });
  });

  expect(result.current.savedMoods.length).toBe(1);
  expect(result.current.savedMoods[0].name).toBe("happy");
});

