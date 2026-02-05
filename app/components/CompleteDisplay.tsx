import { example } from '@/app/types/database';
interface CompleteDisplayProps {word: string,
                                meaning: string,
                                examples: example[],
                                failed?: boolean

}

export default function CompleteDisplay({word, meaning, examples, failed}: CompleteDisplayProps) {
    console.log(examples)
    // return (<div>
    //        <p>{failed?"Practice makes progress. Remeber to play this game every day to see results!":"Congrats. You guessed the word!"}</p> 
    //        <div>
    //         <h1>{`The meaning of ${word}`}</h1>
    //         <p>{meaning}</p>
    //        </div>
    //        {examples.length > 0 && 
    //        (<div>
    //         <h1 className="underline">Examples for the word</h1>
    //         <ul>
    //             {examples.map((example) => (
    //                 <div key={example.id}>
    //                 <li>{example.example_standard}</li>
    //                 <li>{example.example_funny}</li>
    //                 </div>))}
                    
    //         </ul>
    //         </div>)}

    //        </div>)
// return (
//   <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-4 space-y-4">
//     <p className="text-gray-700 font-medium">
//       {failed
//         ? "Practice makes progress. Remember to play this game every day to see results!"
//         : "Congrats! You guessed the word!"}
//     </p>

//     {/* <div className="space-y-2">
//       <h3 className="text-[#2d76c0] font-semibold">
//         {`The meaning of ${word}`}
//       </h3>
//       <p className="text-gray-700">{meaning}</p>
//     </div> */}

//     {examples.length > 0 && (
//       <div className="space-y-2">
//         <h4 className="text-[#009CDE] font-medium ">
//           Examples for the word
//         </h4>
//         <ul className="list-disc list-inside text-gray-700 space-y-1">
//           {examples.map((example) => (
//             <div key={example.id}>
//               <p>{example.example_standard}</p>
//               <p className="italic text-gray-500">{example.example_funny}</p>
//             </div>
//           ))}
//         </ul>
//       </div>
//     )}
//   </div>
// );
// return (
//   <div className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-3xl p-6 space-y-4 shadow-md">
    
//     {/* Main message */}
//     <p className="text-2xl font-bold text-[#1e40af]">
//       {failed
//         ? "Practice makes progress. Remember to play this game every day to see results!"
//         : "Congrats! You guessed the word!"}
//     </p>

//     {/* Examples section */}
//     {examples.length > 0 && (
//       <div className="space-y-3">
//         <h4 className="text-xl font-semibold text-[#1e40af]">
//           Examples for the word
//         </h4>
//         <ul className="list-disc list-inside space-y-2 text-[#1e40af]">
//           {examples.map((example) => (
//             <li key={example.id} className="bg-white rounded-lg p-3 shadow-sm">
//               <p className="font-medium">{example.example_standard}</p>
//               <p className="italic text-gray-500 mt-1">{example.example_funny}</p>
//             </li>
//           ))}
//         </ul>
//       </div>
//     )}
//   </div>
// );
// return (
//   <div className="space-y-4 p-4">

//     {/* Main message for failed */}
//     {failed && (
//       <p className="text-2xl font-bold text-black">
//         Practice makes progress. Remember to play this game every day to see results!
//       </p>
//     )}

//     {/* Examples section */}
//     {examples.length > 0 && (
//       <div className="space-y-4">
//         {examples.map((example) => (
//           <div key={example.id}>
//             <p className="font-bold text-xl text-black">{example.example_standard}</p>
//             <p className="italic text-black mt-1">{example.example_funny}</p>
//           </div>
//         ))}
//       </div>
//     )}

//   </div>
// );
return (
  <div className="bg-gray-100 rounded-xl p-6 space-y-4">

    {/* Examples section */}
    {examples.length > 0 && (
      <div className="space-y-3">
        {examples.slice(0, 2).map((example) => (
          <div key={example.id}>
            <p className="font-bold text-xl text-gray-700">
              {example.example_standard}
            </p>
            <p className="font-bold text-xl text-gray-700 mt-1">
              {example.example_funny}
            </p>
          </div>
        ))}
      </div>
    )}

  </div>
);

}