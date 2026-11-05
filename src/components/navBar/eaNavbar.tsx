"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import ConfirmModal from "@/components/modal/confirmModal";

import "./navlink.css";

export default function EaNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { status, data } = useSession();

  const [isModalOpen, setModalOpen] = useState(false);

  const handleConfirm = async () => {
    await signOut({ redirect: false }); // Sign out without automatic redirect
    router.push("/");
    setModalOpen(false);
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  let authNav: React.ReactNode;

  if (status === "loading") {
    // Reserve the space without showing Log In or the user menu,
    // so signed-in users don't see a flash of the signed-out navbar.
    authNav = (
      <span className="nav-link" data-testid="auth-loading" aria-hidden="true">
        <span className="placeholder" style={{ width: "4rem" }} />
      </span>
    );
  } else if (status === "authenticated") {
    const displayName = data.user?.name ?? data.user?.email ?? "Account";
    authNav = (
      <NavDropdown title={displayName} id="user-dropdown">
        <NavDropdown.Item as={Link} href="/user/tmnts" className="user-nav-item">
          Tournaments
        </NavDropdown.Item>
        <NavDropdown.Item as={Link} href="/user/acctInfo" className="user-nav-item">
          Account
        </NavDropdown.Item>
        <NavDropdown.Item
          as="button"
          className="user-nav-item"
          onClick={() => setModalOpen(true)}
        >
          Log out
        </NavDropdown.Item>
      </NavDropdown>
    );
  } else {
    authNav = (
      <Nav.Link
        as={Link}
        href="/api/auth/signin"
        active={pathname === "/api/auth/signin"}
      >
        Log In
      </Nav.Link>
    );
  }

  return (
    <Navbar bg="primary" variant="dark" sticky="top" expand="sm" collapseOnSelect>
      <Container fluid>
        <Navbar.Brand as={Link} href="/">
          BT DB
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="justify-content-center" style={{ flex: 1 }}>
            <Nav.Link as={Link} href="/hello" active={pathname === "/hello"}>Hello</Nav.Link>
            <Nav.Link as={Link} href="/results" active={pathname === "/results"}>Results</Nav.Link>
            <Nav.Link as={Link} href="/upcoming" active={pathname === "/upcoming"}>Upcoming</Nav.Link>
            <Nav.Link as={Link} href="/contact" active={pathname === "/contact"}>Contact</Nav.Link>
            {/* <Nav.Link as={Link} href="/secret" active={pathname === "/secret"}>Secret</Nav.Link> */}
            <Nav.Link as={Link} href="/sample" active={pathname === "/sample"}>Sample</Nav.Link>
            {authNav}
          </Nav>
        </Navbar.Collapse>
      </Container>
      <ConfirmModal
        show={isModalOpen}
        title="Confirm log out"
        message="Do you want to log out?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Navbar>
  );
}
