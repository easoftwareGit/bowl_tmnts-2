"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, Nav, Navbar } from "react-bootstrap";
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useSession } from "next-auth/react"; 
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react"; 
import ModelConfirm from "@/components/modal/confirmModal"
import { useState } from "react";

import "./navlink.css";
import UserPage from "@/app/user/page";

export default function EaNavbar() {

  const pathname = usePathname();
  const { status, data } = useSession();    

  const [isModalOpen, setModalOpen] = useState(false)

  const handleConfirm = () => {
    signOut();
    setModalOpen(false)
  }

  const handleCancel = () => {
    setModalOpen(false)
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
            {status === 'authenticated' ? (              
              <>
                <NavDropdown title={ data.user?.name } id="user-dropdown">
                  <NavDropdown.Item
                    href="/user/tmnts"
                    className="user-nav-item"
                  >
                    Tournaments
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    href="/user"
                    className="user-nav-item"
                  >
                    Account
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    role="button"
                    href=""
                    className="user-nav-item"
                    onClick={() => setModalOpen(true)}
                  >
                    Log out
                  </NavDropdown.Item>
                </NavDropdown>                  
              </>
            ) : (                
              <Nav.Link as={Link} href="/api/auth/signin" active={pathname === "/api/auth/signin"}>Log In</Nav.Link>
            ) }
          </Nav>
        </Navbar.Collapse>
      </Container>
      <ModelConfirm
        show={isModalOpen}  
        title="Confirm log out"
        message="Do you want to log out?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Navbar>
  );
}
