import React from 'react';

function Home() {
  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="https://e-vidya-teal.vercel.app"
        title="Embedded Content"
        style={{
          width: '100%',
          height: '150%',
          border: 'none',
        }}
      />
    </div>
  );
}

export default Home;
