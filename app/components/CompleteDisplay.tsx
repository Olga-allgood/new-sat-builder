import { example } from '@/app/types/database';
interface CompleteDisplayProps {word: string,
                                meaning: string,
                                examples: example[],
                                failed?: boolean

}

export default function CompleteDisplay({word, meaning, examples, failed}: CompleteDisplayProps) {
    console.log(examples)
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