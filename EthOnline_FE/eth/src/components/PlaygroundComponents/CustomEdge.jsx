import React, { useState, useRef, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

const CustomEdge = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [showDelete, setShowDelete] = useState(false);
  const hideTimeoutRef = useRef(null);
  const [animationOffset, setAnimationOffset] = useState(0);

  // Animation effect for moving arrows
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationOffset(prev => (prev + 0.008) % 1); // Slower movement for elegant effect
    }, 80); // Update every 80ms for smoother, slower animation

    return () => clearInterval(interval);
  }, []);

  // Function to calculate position along bezier curve
  const getPointOnBezierCurve = (t) => {
    // Extract control points from the bezier path
    const dx = targetX - sourceX;
    
    // Calculate control points for a smooth curve
    const controlOffsetX = Math.abs(dx) * 0.5;
    
    const cp1X = sourceX + controlOffsetX;
    const cp1Y = sourceY;
    const cp2X = targetX - controlOffsetX;
    const cp2Y = targetY;
    
    // Cubic bezier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
    const x = Math.pow(1 - t, 3) * sourceX + 
              3 * Math.pow(1 - t, 2) * t * cp1X + 
              3 * (1 - t) * Math.pow(t, 2) * cp2X + 
              Math.pow(t, 3) * targetX;
              
    const y = Math.pow(1 - t, 3) * sourceY + 
              3 * Math.pow(1 - t, 2) * t * cp1Y + 
              3 * (1 - t) * Math.pow(t, 2) * cp2Y + 
              Math.pow(t, 3) * targetY;
    
    return { x, y };
  };

  // Function to calculate tangent angle at a point on the curve
  const getTangentAngle = (t) => {
    const dx = targetX - sourceX;
    
    const controlOffsetX = Math.abs(dx) * 0.5;
    
    const cp1X = sourceX + controlOffsetX;
    const cp1Y = sourceY;
    const cp2X = targetX - controlOffsetX;
    const cp2Y = targetY;
    
    // Derivative of cubic bezier: B'(t) = 3(1-t)²(P₁-P₀) + 6(1-t)t(P₂-P₁) + 3t²(P₃-P₂)
    const dx_dt = 3 * Math.pow(1 - t, 2) * (cp1X - sourceX) + 
                  6 * (1 - t) * t * (cp2X - cp1X) + 
                  3 * Math.pow(t, 2) * (targetX - cp2X);
                  
    const dy_dt = 3 * Math.pow(1 - t, 2) * (cp1Y - sourceY) + 
                  6 * (1 - t) * t * (cp2Y - cp1Y) + 
                  3 * Math.pow(t, 2) * (targetY - cp2Y);
    
    return Math.atan2(dy_dt, dx_dt) * (180 / Math.PI);
  };

  // Function to create arrow markers along the path
  const createArrowMarkers = () => {
    // Only show animated arrows for non-conditional edges
    if (data?.type?.includes('conditional')) {
      return null;
    }
    
    const arrowCount = 3; // Fixed number of arrows for better animation
    const arrows = [];
    const arrowColor = style.stroke || '#1E40AF';

    for (let i = 0; i < arrowCount; i++) {
      // Calculate animated position along the path
      const basePosition = (i / arrowCount) + animationOffset;
      const t = basePosition % 1; // Keep position between 0 and 1
      
      // Get position on the actual bezier curve
      const { x, y } = getPointOnBezierCurve(t);
      
      // Calculate rotation angle based on curve tangent
      const angle = getTangentAngle(t);
      
      arrows.push(
        <g key={i} transform={`translate(${x}, ${y}) rotate(${angle})`}>
          <path
            d="M0,0 L-12,-6 L-8,0 L-12,6 Z"
            fill={arrowColor}
            stroke={arrowColor}
            strokeWidth="0.5"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
          />
        </g>
      );
    }
    
    return arrows;
  };

  const show = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowDelete(true);
  };

  const hideWithDelay = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowDelete(false);
      hideTimeoutRef.current = null;
    }, 200);
  };

  return (
    <>
      {/* Visible edge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          cursor: 'pointer',
        }}
      />

      {/* Directional arrows */}
      <g>
        {createArrowMarkers()}
      </g>

      {/* Invisible wide interaction path to reliably capture hover/clicks */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        style={{ pointerEvents: 'all' }}
        className="react-flow__edge-interaction"
        onMouseEnter={show}
        onMouseLeave={hideWithDelay}
        onClick={() => setShowDelete((v) => !v)}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 1000,
          }}
          className="nodrag nopan"
          onMouseEnter={show}
          onMouseLeave={hideWithDelay}
        >
          {/* Condition badge and actions */}
          <div className="flex items-center gap-1 justify-center">
            {data?.type === 'conditional-true' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof data?.onShowCondition === 'function') {
                    data.onShowCondition();
                  }
                }}
                className="px-2 py-0.5 rounded text-[10px] font-medium border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
                title="View condition details"
              >
                ✓ True
              </button>
            )}
            {data?.type === 'conditional-false' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof data?.onShowCondition === 'function') {
                    data.onShowCondition();
                  }
                }}
                className="px-2 py-0.5 rounded text-[10px] font-medium border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors"
                title="View condition details"
              >
                ✗ False
              </button>
            )}
            {data?.type === 'conditional' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof data?.onShowCondition === 'function') {
                    data.onShowCondition();
                  }
                }}
                className="px-2 py-0.5 rounded text-[10px] font-medium border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors"
                title="View condition details"
              >
                Condition
              </button>
            )}

            {showDelete && data?.onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete();
                  setShowDelete(false);
                }}
                className="w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                title="Delete connection"
              >
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
