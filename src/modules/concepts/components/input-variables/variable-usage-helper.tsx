import React from 'react';
import { Variable, Info } from 'lucide-react';
import { InputVariable } from '../../utils/objects/node-type-registry';

interface VariableUsageHelperProps {
  inputVariables: InputVariable[];
  className?: string;
}

const VariableUsageHelper: React.FC<VariableUsageHelperProps> = ({
  inputVariables,
  className = ""
}) => {
  if (inputVariables.length === 0) {
    return null;
  }

  return (
    <div className={`bg-indigo-50 border border-indigo-200 rounded-md p-3 ${className}`}>
      <div className="flex items-start">
        <Variable className="h-4 w-4 text-indigo-600 mt-0.5 mr-2" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-indigo-800 mb-2">Available Variables</h4>
          <div className="space-y-1">
            {inputVariables.map((variable, index) => (
              <div key={index} className="text-xs">
                <code className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-mono">
                  {"{{" + variable.name + "}}"}
                </code>
                <span className="text-indigo-600 ml-2">
                  from {variable.coming_node === 'system' ? 'System' : variable.coming_node}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-indigo-200">
            <p className="text-xs text-indigo-600">
              <Info className="h-3 w-3 inline mr-1" />
              Use these variables in your system prompt with the {"{{variable_name}}"} syntax
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariableUsageHelper;
