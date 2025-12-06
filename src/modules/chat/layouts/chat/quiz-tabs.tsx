import { JSX } from 'react';

interface TabProps {
  activeTab: string;
  tabs: {
    key: string;
    content: JSX.Element;
  }[];
  onSetActiveTab: (val: string) => void;
}
export default function QuizTabs({
  tabs,
  activeTab,
  onSetActiveTab
}: TabProps) {
  const activeContent = tabs.find(tab => tab.key === activeTab)?.content || <></>
  return (
    <div className="w-full mt-[68px]">
      <div className="border-b border-gray-200 flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onSetActiveTab(tab.key)}
            className={`pb-2 text-sm font-medium border-b-2 transition-all duration-300 ${
              activeTab === tab.key
                ? "border-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab.key}
          </button>
        ))}
      </div>

      <div className="mt-[57px]">
        {
          activeContent
        }
      </div>
    </div>
  );
}
