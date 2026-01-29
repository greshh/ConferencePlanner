import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PopUp } from ".";

describe("Pop Up", ()=>{
  const cancelOnClick = vi.fn();

  it("calls cancelOnClick when escape key is pressed", async ()=>{
    const cancelOnClick = vi.fn();
    
    render(<PopUp cancelOnClick={cancelOnClick}/>)

    await userEvent.keyboard("{Escape}");
    expect(cancelOnClick).toBeCalled();
  });

  it("does not call cancelOnClick for other keys", async ()=>{
    const cancelOnClick = vi.fn();

    render(<PopUp cancelOnClick={cancelOnClick}/>)

    await userEvent.keyboard("{Enter}");
    expect(cancelOnClick).not.toHaveBeenCalled();
  });

  it("renders message", ()=>{
    const message = "Test";

    render(<PopUp message={message} cancelOnClick={cancelOnClick}/>);

    expect(screen.queryByText(message)).toBeInTheDocument();
  });

  it("renders an option as a working button", ()=>{
    const testOnClick = vi.fn();
    const options = [
      {
        label: "Test",
        onClick: ()=>{testOnClick()}
      }
    ];

    render(<PopUp options={options} cancelOnClick={cancelOnClick}/>)

    const button = screen.queryByRole("button");

    expect(button).toBeInTheDocument();
    expect(screen.queryByText(options[0].label));

    fireEvent.click(button);

    expect(testOnClick).toBeCalled();
  });

  it("renders input text", ()=>{
    render(<PopUp inputText={"Test"} cancelOnClick={cancelOnClick}/>)

    const input = screen.queryByRole("textbox");

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "link");
  });

  it("renders input file", ()=>{
    render(<PopUp inputFile={"True"} cancelOnClick={cancelOnClick}/>)

    const fileUpload = screen.getByTestId("file-input");
    const fileNameInput = screen.getByRole("textbox");

    expect(fileUpload).toBeInTheDocument();
    expect(fileUpload).toHaveAttribute("id", "file");
    expect(fileNameInput).toBeInTheDocument();
    expect(fileNameInput).toHaveAttribute("id", "attachment-name");
  });

  it("renders inputs when attaching a link", ()=>{
    render(<PopUp message={"Link"} cancelOnClick={cancelOnClick}/>)

    const textboxes = screen.getAllByRole("textbox");

    expect(textboxes).toHaveLength(2);
    expect(textboxes[0]).toHaveAttribute("id", "link");
    expect(textboxes[1]).toHaveAttribute("id", "attachment-name");
  });
});