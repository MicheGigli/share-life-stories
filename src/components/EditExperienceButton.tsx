import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface EditExperienceButtonProps {
  experienceId: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const EditExperienceButton = ({ 
  experienceId, 
  variant = 'outline',
  size = 'sm'
}: EditExperienceButtonProps) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/edit/${experienceId}`);
  };

  return (
    <Button variant={variant} size={size} onClick={handleEdit}>
      <Edit className="h-4 w-4" />
      {size !== 'icon' && ' Modifica'}
    </Button>
  );
};