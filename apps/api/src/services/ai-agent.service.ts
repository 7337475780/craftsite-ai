import { BuilderProject, BuilderNode } from "@craftsite/shared";

// The Context Extraction Engine summarizes a potentially massive BuilderProject 
// into a lightweight, token-efficient structure for LLM prompts.
export function extractWebsiteContext(project: BuilderProject, activePageId: string | null) {
  const activePage = project.pages?.find(p => p.id === activePageId) || project.pages?.[0];
  
  const extractNodeSummary = (node: BuilderNode): any => {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      props: node.props,
      children: node.children?.map(extractNodeSummary) || []
    };
  };

  return {
    theme: project.theme,
    currentPage: activePage ? {
      id: activePage.id,
      title: activePage.title,
      slug: activePage.slug,
      domTree: activePage.nodes?.map(extractNodeSummary)
    } : null,
    memory: {
      targetAudience: "Startups and SaaS companies", // Simulated memory
      brandTone: "Professional, clean, and modern"
    }
  };
}

// Simulated Agent for Conversational Editing (DOM Manipulation)
export function generateStructuralDiff(prompt: string, targetNodeId: string | null, context: any) {
  // If no target node is selected, generate a generic new section
  if (!targetNodeId) {
    return {
      type: "append_node",
      node: {
        id: `ai-gen-${Date.now()}`,
        type: "section",
        name: "hero",
        props: { 
          heading: "Generated via AI", 
          description: "This node was appended by the AI based on: " + prompt 
        },
        children: []
      }
    };
  }

  // If the prompt asks for SEO/Accessibility improvements
  if (prompt.toLowerCase().includes("seo") || prompt.toLowerCase().includes("access")) {
    return {
      type: "replace_node",
      nodeId: targetNodeId,
      node: {
        id: targetNodeId,
        type: "section",
        name: "card",
        props: { 
          title: "Optimized Component", 
          ariaLabel: "Optimized accessible component",
          altText: "Descriptive alt text for SEO"
        },
        children: []
      }
    };
  }

  // Default behavior: modify the selected component dynamically
  return {
    type: "replace_node",
    nodeId: targetNodeId,
    node: {
      id: targetNodeId,
      type: "element",
      name: "button",
      props: { label: "AI Enhanced: " + prompt.substring(0, 15) },
      children: []
    }
  };
}

// Simulated Agent for SEO, Performance, and Design Critique
export function generateWebsiteCritique(context: any) {
  return {
    seo: {
      score: 72,
      recommendations: [
        "Add meta descriptions to 3 pages.",
        "Include descriptive 'alt' tags for Hero images."
      ]
    },
    accessibility: {
      score: 85,
      recommendations: [
        "Increase contrast ratio on primary buttons.",
        "Ensure all navigation links have ARIA labels."
      ]
    },
    design: {
      score: 90,
      recommendations: [
        "Spacing between sections is slightly inconsistent.",
        "Consider using a secondary accent color for emphasis."
      ]
    }
  };
}
