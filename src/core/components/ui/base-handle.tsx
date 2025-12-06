import { cn } from "@/core/lib/utils";
import { Handle, HandleProps, useHandleConnections, useNodeConnections } from "@xyflow/react";
import { forwardRef } from "react";

export type BaseHandleProps = HandleProps & {
  connectionCount?: number; // Add a prop to specify the maximum number of connections
};

export const BaseHandle = forwardRef<HTMLDivElement, BaseHandleProps>(
  ({ className, children, connectionCount = 1, ...props }, ref) => {
    const connections = useNodeConnections({
      handleType: props.type,
      handleId: props.id || undefined,
    });

    const isConnected = connections.length > 0;
    const isConnectable = connections.length < connectionCount;

    return (
      <Handle
        ref={ref}
        {...props}
        isConnectable={isConnectable}
        className={cn(
          "!h-[11px] !w-[11px] !rounded-full !border !transition",
          isConnected
            ? "!bg-primary !border-primary"
            : "!border-slate-300 !bg-slate-100 !dark:border-secondary !dark:bg-secondary",
          className
        )}
      >
        {children}
      </Handle>
    );
  }
);

BaseHandle.displayName = "BaseHandle";
