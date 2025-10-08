import React from 'react';
import { useParams } from 'react-router';

function Upcoming() {
  const { session } = useParams();

  return (
    <div className="min-h-screen bg-[#EDF6F9] flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-[#006D77]">
        <h1 className="text-4xl font-extrabold mb-6 text-center">📚 Upcoming</h1>
        
        <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#83C5BE]">
          <p className="text-lg font-medium">Session ID:</p>
          <p className="font-mono text-sm text-[#457B9D] break-all">{session}</p>
        </div>

        <div className="mt-6 text-center">
          <button className="bg-[#006D77] text-white px-4 py-2 rounded hover:bg-[#005661] transition">
            Will be available soon!
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upcoming;

// import React from 'react';
// import { useParams } from 'react-router';

// function Upcoming() {
//   // Get sessionId from URL
//   const { session } = useParams();

//   return (
//     <div className="p-6 min-h-screen bg-[#EDF6F9] text-[#006D77]">
//       <h1 className="text-3xl font-bold mb-4">FlashCards</h1>
//       <p>Session ID: <span className="font-mono">{session}</span></p>

//     </div>
//   );
// }

// export default Upcoming;
