import React from "react";
import { render, screen } from "@testing-library/react";
import { TaskBubble } from "../TaskBubble";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

describe("Task Bubble", ()=>{

  it("renders the task's name", ()=>{
    const task_name = "Create";

    render(<TaskBubble task={{ task_name: task_name, completed: false }} onToggleComplete={()=>{}} isGuest={false}/>);
    expect(screen.queryByText(task_name)).toBeInTheDocument();
  });

  it("renders the task as incomplete with checkbox and standard task name", ()=>{
    const task_name = "Create";
    const completion = false;
    
    render(<TaskBubble task={{ task_name: task_name, completed: completion }} onToggleComplete={()=>{}} isGuest={false}/>);

    const checkbox = screen.queryByTestId("checkbox");

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText(task_name)).toHaveStyle({ textDecoration: "none" })
  });

  it("renders the task as complete with checkbox and crossed-out task name", ()=>{
    const task_name = "Create";
    const completion = true;
    
    render(<TaskBubble task={{ task_name: task_name, completed: completion }} onToggleComplete={()=>{}} isGuest={false}/>);
    
    const checkbox = screen.queryByTestId("checkbox");

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(task_name)).toHaveStyle({ textDecoration: "line-through" })
  });

  it("toggles completion status when checkbox is clicked", async ()=>{
    const onToggleComplete = vi.fn();
    const task_id = 1;

    render(<TaskBubble task={{ task_id: task_id, task_name: "", completed: false }} onToggleComplete={onToggleComplete} isGuest={false} />);

    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(checkbox);

    expect(onToggleComplete).toHaveBeenCalledWith(task_id);
  });
})