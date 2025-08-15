// frontend/routes/projects/$projectId.tsx
import { useParams } from "react-router-dom";
import { ProjectDetail } from "../../components/projects/ProjectDetail";

export default function ProjectDetailRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  
  if (!projectId) {
    return <div>Project ID is required</div>;
  }
  
  return <ProjectDetail />;
}