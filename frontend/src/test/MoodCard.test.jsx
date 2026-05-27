import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MoodCard from "../components/MoodCard/MoodCard";
import "@testing-library/jest-dom";

test("renders mood name", () => {
  render(
    <BrowserRouter>
      <MoodCard mood={{ name: "happy", slug: "happy", image: null }} />
    </BrowserRouter>
  );

  expect(screen.getByText("happy")).toBeInTheDocument();
});

