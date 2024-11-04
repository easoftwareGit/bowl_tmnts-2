import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Container } from "@/components/boostrap";
import EaNavbar from "@/components/navBar/eaNavbar";
import { ReduxProvider } from "@/redux/provider";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bowl Tmnts DB",
  description: "Bowling Tournaments Database",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ReduxProvider>
            <EaNavbar />
            <main>
              <Container fluid className="py-3">
                {children}
              </Container>
            </main>
          </ReduxProvider>
        </Providers>
      </body>
    </html>
  );
}
