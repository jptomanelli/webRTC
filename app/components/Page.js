import { Container } from '@material-ui/core';
import NavBar from "./NavBar";

export default function Page({ children }) {

  return (
    <>
      <NavBar />
      <Container maxWidth="md">
        {children}
      </Container>
      <style global jsx>{`
        body {
          margin: 0;
        }
      `}</style>
    </>
  );
};