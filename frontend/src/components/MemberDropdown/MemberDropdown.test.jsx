import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MemberDropdown } from ".";

describe("Member Dropdown", ()=>{
  const emptyAssigned = {
    assigned: [],
    committees: []
  };

  const emptyTask = {
    task_id: 0
  };

  it("renders working add button", ()=>{
    render(<MemberDropdown task={emptyTask} assigned={emptyAssigned}/>);
    
    const memberAddButton = screen.getByTestId("member-dropdown-button");

    expect(memberAddButton).toBeInTheDocument();

    // fireEvent.click(memberAddButton);

    // expect()
  })
});