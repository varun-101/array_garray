import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  code: string; // LLM or sanitized Mermaid code
  theme?: "default" | "forest" | "dark"; // optional Mermaid themes
}


const MermaidChart: React.FC<MermaidChartProps> = ({ code, theme = "forest" }) => {
    const containerRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      if (!containerRef.current) return;
  
      // Initialize Mermaid
      mermaid.initialize({
        startOnLoad: true,
        theme,
        flowchart: { curve: "linear" }, // optional: linear, basis, step
      });
  
      try {
        // Render diagram
        mermaid.render("mermaid-diagram", code).then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        });
      } catch (err) {
        console.error("Error rendering Mermaid diagram:", err);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            "<pre style='color:red;'>Error rendering Mermaid diagram. Check syntax.</pre>";
        }
      }
    }, [code, theme]);
  
    return <div ref={containerRef} className="bg-white" />;
  };
  
  export default MermaidChart;
  