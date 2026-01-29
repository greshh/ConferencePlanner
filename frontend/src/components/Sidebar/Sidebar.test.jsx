import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { navigateMock } from "../../setupTest";
import { Sidebar } from ".";

describe("Sidebar", ()=>{
  
  it("renders user details when logged in", ()=>{
    const user = {
      member_id: 1,
      first_name: "Jesus",
      last_name: "Christ",
    };

    initializeApp({ apiKey: "test", authDomain: "test", projectId: "test" });

    render(
    <MemoryRouter>
      <Sidebar user={user} />
    </MemoryRouter>
    );

    const profilePic = screen.getByRole("img");

    expect(screen.queryByText(user.first_name + " " + user.last_name)).toBeInTheDocument();
    expect(profilePic.getAttribute("src").endsWith(`${user.member_id}.jpg`)).toBe(true);
  });

  it("renders user details when in guest mode", ()=>{
    initializeApp({ apiKey: "test", authDomain: "test", projectId: "test" });

    render(
    <MemoryRouter>
      <Sidebar isGuest={true} />
    </MemoryRouter>
    );

    expect(screen.queryByText("Log In")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("has a link directing to the task list", ()=>{
    initializeApp({ apiKey: "test", authDomain: "test", projectId: "test" });

    render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
    );

    const taskListLink = screen.getByTestId("task-list-link");

    expect(taskListLink).toBeInTheDocument();
    expect(taskListLink.getAttribute("href")).toBe("/tasks");
  })

  it("renders default profile picture for an user with no set picture", ()=>{
    const user = {
      member_id: -1,
      first_name: "Jesus",
      last_name: "Christ",
    };

    initializeApp({ apiKey: "test", authDomain: "test", projectId: "test" });

    render(
    <MemoryRouter>
      <Sidebar user={user} />
    </MemoryRouter>
    );

    const profilePic = screen.getByRole("img");

    fireEvent.error(profilePic);

    expect(profilePic.getAttribute("src").endsWith("unknown.jpg")).toBe(true);
  });

  it("signs out user when clicking profile picture when logged in", async ()=>{
    const user = {
      member_id: 1,
      first_name: "Jesus",
      last_name: "Christ",
    };

    const removeCookie = vi.fn();

    initializeApp({ apiKey: "test", authDomain: "test", projectId: "test" });

    render(
    <MemoryRouter>
      <Sidebar user={user} removeCookie={removeCookie}/>
    </MemoryRouter>
    );

    const profilePic = screen.getByRole("img");

    await userEvent.click(profilePic);
  
    await new Promise(process.nextTick);
    expect(signOut).toHaveBeenCalled();
    expect(removeCookie).toHaveBeenCalledWith("memberId");
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("logs error on failed sign out", async ()=>{
    const user = {
      member_id: 1,
      first_name: "Jesus",
      last_name: "Christ",
    };

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const removeCookie = vi.fn();

    initializeApp({ apiKey: "test", authDomain: "test", projectId: "test" });

    const { signOut } = await import("firebase/auth");
    signOut.mockImplementationOnce(() => Promise.reject(new Error("Test Error")));

    render(
    <MemoryRouter>
      <Sidebar user={user} removeCookie={removeCookie}/>
    </MemoryRouter>
    );

    const profilePic = screen.getByRole("img");

    await userEvent.click(profilePic);
  
    await new Promise(process.nextTick);
    expect(signOut).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("Unable to log out:", "Test Error");
    consoleSpy.mockRestore();
  });

  it("redirects user to log in page in guest mode", async ()=>{
    const removeCookie = vi.fn();

    initializeApp({ apiKey: "test", authDomain: "test", projectId: "test" });

    render(
    <MemoryRouter>
      <Sidebar isGuest={true} removeCookie={removeCookie}/>
    </MemoryRouter>
    );

    const logInLink = screen.getByText("Log In");

    await userEvent.click(logInLink);
  
    expect(logInLink.getAttribute("href")).toBe("/");
  });
});