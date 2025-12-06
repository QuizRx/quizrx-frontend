import { BaseHandle } from "@/core/components/ui/base-handle";
import { BaseNode } from "@/core/components/ui/base-node";
import { Button } from "@/core/components/ui/button";
import {
  NodeHeader,
  NodeHeaderIcon,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderInfoAction,
  NodeHeaderDeleteAction,
} from "@/core/components/ui/node-header";
import {
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Sheet,
} from "@/core/components/ui/sheet";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import { LucideIcon, Edit3, Check, X, Loader2 } from "lucide-react";
import { memo, useState, useRef, useCallback, useEffect } from "react";
import {
  NodeTypeRegistry,
  NodeTypes,
} from "../../utils/objects/node-type-registry";
import { renderHandles } from "./render_handles";

// Define a more specific NodeProps type for our component
interface CustomNodeProps extends NodeProps {
  data: {
    type: NodeTypes;
    name?: string;
    description?: string;
    Icon?: LucideIcon;
    form?: React.ReactNode;
    color?: string;
    [key: string]: any;
    streaming_details?: Record<string, any>;
  };
}

const BaseNodeWithHeader = memo(({ data, selected, id }: CustomNodeProps) => {
  // Extract the node type and then get the rest of the data
  const nodeType = (data?.type as string) || "default";
  const { setNodes } = useReactFlow();

  // Get display data - either from passed data or from registry as fallback
  const nodeData = {
    ...(NodeTypeRegistry[nodeType] || {}), // Default values from registry
    ...data, // Override with any specific instance data
  };  // Use standard node properties only (name and description are no longer in formData)
  const displayName = data?.name || nodeData?.name || "Node Title";
  const displayDescription = data?.description || nodeData?.description || "Node Info detail is written here ...";

  const [localName, setLocalName] = useState(() => displayName);
  const [localDescription, setLocalDescription] = useState(() => displayDescription);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const color = nodeData?.color || "";
  const IconComponent = nodeData?.Icon as LucideIcon;
  const NodeForm = nodeData?.form;

  // Update local state when data changes
  useEffect(() => {
    const newDisplayName = data?.name || nodeData?.name || "Node Title";
    const newDisplayDescription = data?.description || nodeData?.description || "Node Info detail is written here ...";
    setLocalName(newDisplayName);
    setLocalDescription(newDisplayDescription);
  }, [data?.name, data?.description, nodeData?.name, nodeData?.description]);  // Update node data in the flow (only standard properties)
  const updateNodeData = useCallback((updates: Partial<typeof data>) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                ...updates
              }
            }
          : node
      )
    );
  }, [id, setNodes]);

  // Name editing handlers
  const handleNameEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, []);

  const saveName = useCallback(() => {
    updateNodeData({ name: localName });
    setIsEditingName(false);
  }, [localName, updateNodeData]);  const cancelNameEdit = useCallback(() => {
    const currentName = data?.name || nodeData?.name || "Node Title";
    setLocalName(currentName);
    setIsEditingName(false);
  }, [data?.name, nodeData?.name]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      saveName();
    } else if (e.key === 'Escape') {
      cancelNameEdit();
    }
  }, [saveName, cancelNameEdit]);

  // Description editing handlers
  const handleDescriptionEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDescription(true);
    setTimeout(() => descriptionInputRef.current?.focus(), 0);
  }, []);

  const saveDescription = useCallback(() => {
    updateNodeData({ description: localDescription });
    setIsEditingDescription(false);
  }, [localDescription, updateNodeData]);
  const cancelDescriptionEdit = useCallback(() => {
    const currentDescription = data?.description || nodeData?.description || "Node Info detail is written here ...";
    setLocalDescription(currentDescription);
    setIsEditingDescription(false);
  }, [data?.description, nodeData?.description]);

  const handleDescriptionKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && e.ctrlKey) {
      saveDescription();
    } else if (e.key === 'Escape') {
      cancelDescriptionEdit();
    }
  }, [saveDescription, cancelDescriptionEdit]);

  // Generate background color for the icon based on node type
  const getIconClasses = (selected: boolean, color: string) => {
    if (selected) return "text-primary";
    return `text-${color}`;
  };

  // Generate border classes based on streaming_details
  const getBorderClasses = () => {
    if (nodeData.streaming_details?.streaming === true) {
      return "border-green-500 border-2";
    } else if (nodeData.streaming_details) {
      return "border-gray-500 border-2";
    }
    return "";
  };  // Prevent sheet from opening when editing
  const handleNodeClick = useCallback((e: React.MouseEvent) => {
    if (isEditingName || isEditingDescription) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [isEditingName, isEditingDescription]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <BaseNode
          selected={selected}
          className={`flex flex-col gap-2 p-2 min-w-48 relative ease-linear duration-200 ${getBorderClasses()}`}
          onClick={handleNodeClick}
        >          {/* Render handles based on node type */}
          {renderHandles({ nodeType, nodeData: data })}
            <NodeHeader className="text-foreground">
            <NodeHeaderIcon>
              {nodeData.streaming_details?.streaming ? (
                <Loader2 className="h-4 w-4 animate-spin text-green-500" />
              ) : (
                IconComponent && (
                  <IconComponent className={getIconClasses(selected, color)} />
                )
              )}
            </NodeHeaderIcon>
            
            {/* Editable Node Title */}
            <div className="flex-1 flex items-center gap-1">
              {isEditingName ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    ref={nameInputRef}
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    onBlur={saveName}
                    className="text-sm h-6 py-1 px-2 flex-1 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveName();
                    }}
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelNameEdit();
                    }}
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              ) : (
                <NodeHeaderTitle
                  className={`${selected ? "text-primary" : "text-foreground"} cursor-pointer hover:bg-gray-100 hover:text-gray-600 px-1 py-0.5 rounded flex-1 group flex items-center gap-1`}
                  onClick={handleNameEdit}
                >
                  <span className="flex-1 truncate">{localName}</span>
                  <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </NodeHeaderTitle>
              )}
            </div>

            <NodeHeaderActions className="flex flex-row gap-2 items-center">
              <NodeHeaderInfoAction
                tooltip={localDescription}
                selected={selected}
              />
              <NodeHeaderDeleteAction selected={selected} />
            </NodeHeaderActions>
          </NodeHeader>

          {/* Editable Description Section */}
          <div className="text-sm px-2 py-2 border-t border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider">
                Description
              </span>
              {!isEditingDescription && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={handleDescriptionEdit}
                >
                  <Edit3 className="h-3 w-3 text-gray-400" />
                </Button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  ref={descriptionInputRef}
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  onKeyDown={handleDescriptionKeyDown}
                  className="text-xs min-h-[60px] resize-none"
                  placeholder="Enter description..."
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Ctrl+Enter to save</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveDescription();
                      }}
                    >
                      <Check className="h-3 w-3 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelDescriptionEdit();
                      }}
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="text-xs cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors min-h-[32px] flex items-start group"
                onClick={handleDescriptionEdit}
              >
                <span className="flex-1">{localDescription}</span>
                <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity ml-1 flex-shrink-0" />
              </div>
            )}
          </div>          {/* Node Type Label */}
          <div className="text-xs text-secondary px-2 py-1 bg-primary text-foreground rounded text-center">
            {nodeData.streaming_details?.streaming ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              "View"
            )}
          </div>
         
        </BaseNode>
      </SheetTrigger>
      
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{localName}</SheetTitle>
          <SheetDescription>{localDescription}</SheetDescription>
        </SheetHeader>
        {NodeForm}
        
      </SheetContent>
    </Sheet>
  );
});

BaseNodeWithHeader.displayName = "BaseNodeWithHeader";

export default BaseNodeWithHeader;