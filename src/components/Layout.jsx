import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div style={styles.wrapper}>
      <Sidebar />

      <main style={styles.main}>
        <Navbar />

        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f3f4f6',
  },
  main: {
    flex: 1,
  },
  content: {
    padding: '24px',
  },
};

export default Layout;