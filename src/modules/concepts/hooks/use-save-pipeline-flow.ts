import { useMutation } from '@apollo/client';
import { UPDATE_PIPELINE_FLOW_MUTATION } from '../apollo/mutation/pipeline';
import { useCanvasFlow } from '../store/react-flow-store';
import { toast } from '@/core/hooks/use-toast';
import { UpdatePipelineFlowInput } from '../types/api/pipeline';

// Utility function to recursively remove __typename from objects
const removeTypename = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key !== '__typename') {
        newObj[key] = removeTypename(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
};

export const useSavePipelineFlow = () => {
  const {
    nodes,
    edges,
    pipelineId,
    isSaving,
    setSaving,
    markAsClean,
  } = useCanvasFlow();

  const [updatePipelineFlow] = useMutation(UPDATE_PIPELINE_FLOW_MUTATION);

  const saveReactFlow = async () => {
    console.log('use save pipeline flow called');
    if (!pipelineId) {
      toast({
        title: "Error",
        description: "No pipeline ID available for saving",
        variant: "destructive",
      });
      return;
    }

    if (isSaving) {
      return; // Prevent multiple simultaneous saves
    }

    setSaving(true);

    try {
      // Transform nodes and edges to match the expected format and remove __typename
      const transformedNodes = nodes.map(node => {
        const cleanNode = removeTypename(node);
        return {
          id: cleanNode.id,
          type: cleanNode.type || 'default',
          position: cleanNode.position,
          data: {
            id: cleanNode.data?.id || cleanNode.id,
            type: cleanNode.data?.type || cleanNode.type || 'default',
            name: cleanNode.data?.name || 'Unnamed Node',
            description: cleanNode.data?.description || 'No description',
            color: cleanNode.data?.color,
            isEditingName: cleanNode.data?.isEditingName || false,
            isEditingDescription: cleanNode.data?.isEditingDescription || false,
            formData: cleanNode.data?.formData,
            additionalData: cleanNode.data?.additionalData,
            input_variables: cleanNode.data?.input_variables || [],
          },
          measured: cleanNode.measured ? {
            width: cleanNode.measured.width || 0,
            height: cleanNode.measured.height || 0,
          } : undefined,
          selected: cleanNode.selected,
          dragging: cleanNode.dragging,
        };
      });
      console.log(transformedNodes)
      const transformedEdges = edges.map(edge => {
        const cleanEdge = removeTypename(edge);
        return {
          id: cleanEdge.id,
          source: cleanEdge.source,
          target: cleanEdge.target,
          sourceHandle: cleanEdge.sourceHandle === null ? undefined : cleanEdge.sourceHandle,
          targetHandle: cleanEdge.targetHandle === null ? undefined : cleanEdge.targetHandle,
          style: cleanEdge.style ? {
            stroke: cleanEdge.style.stroke,
            strokeWidth: cleanEdge.style.strokeWidth,
          } : undefined,
          animated: cleanEdge.animated,
          selected: cleanEdge.selected,
        };
      });

      const flowData: UpdatePipelineFlowInput = {
        nodes: transformedNodes,
        edges: transformedEdges,
      };

      await updatePipelineFlow({
        variables: {
          id: pipelineId,
          flowData,
        },
        onCompleted: () => {
          markAsClean();
          toast({
            title: "Pipeline saved successfully!",
            description: "Your changes have been saved.",
            variant: "default",
          });
        },
        onError: (error) => {
          toast({
            title: "Save failed",
            description: error.message || "Failed to save pipeline changes",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error('Error saving pipeline flow:', error);
      toast({
        title: "Save failed",
        description: "An unexpected error occurred while saving",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    saveReactFlow,
    isSaving,
  };
};
