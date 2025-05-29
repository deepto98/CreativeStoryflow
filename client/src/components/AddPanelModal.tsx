import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ComicButton } from './ui/comic-button';
import { ComicPanel } from './ui/comic-panel';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Panel } from '@shared/schema';

const formSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  caption: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddPanelModal({ 
  isOpen, 
  onClose, 
  challengeId 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  challengeId: number;
}) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      caption: "",
    },
  });

  // Get the latest panel for reference
  const { data: panels } = useQuery<Panel[]>({
    queryKey: ['/api/panels', challengeId],
    queryFn: () => fetch(`/api/panels?challengeId=${challengeId}`).then(res => res.json()),
  });

  const latestPanel = panels && panels.length > 0 ? panels[panels.length - 1] : null;

  // Generate image mutation
  const generateMutation = useMutation({
    mutationFn: async (values: { prompt: string }) => {
      const res = await apiRequest('POST', '/api/panels/generate', {
        prompt: values.prompt,
        challengeId,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedImage(data.imageUrl);
      setIsGenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Error generating image",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  // Submit panel mutation
  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!generatedImage) {
        throw new Error("Please generate an image first");
      }
      
      const res = await apiRequest('POST', '/api/panels', {
        prompt: values.prompt,
        caption: values.caption,
        imageUrl: generatedImage,
        challengeId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/panels', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/daily'] });
      toast({
        title: "Panel submitted",
        description: "Your panel has been added to the storyboard!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error submitting panel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    const prompt = form.getValues("prompt");
    
    if (prompt.length < 10) {
      form.setError("prompt", { 
        type: "manual", 
        message: "Prompt must be at least 10 characters" 
      });
      return;
    }
    
    setIsGenerating(true);
    generateMutation.mutate({ prompt });
  };

  const onSubmit = (values: FormValues) => {
    submitMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-4 border-black shadow-comic p-0">
        <DialogHeader className="border-b-4 border-black p-4 sticky top-0 bg-white">
          <DialogTitle className="font-bangers text-2xl">Add Your Panel</DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-comic font-bold mb-3">Previous Panel</h4>
              {latestPanel ? (
                <ComicPanel className="aspect-square">
                  <img 
                    src={latestPanel.imageUrl} 
                    alt="Previous panel" 
                    className="w-full h-full object-cover" 
                  />
                </ComicPanel>
              ) : (
                <ComicPanel className="aspect-square flex items-center justify-center">
                  <p className="text-center text-neutral-medium">No previous panel</p>
                </ComicPanel>
              )}
            </div>
            
            <div>
              <h4 className="font-comic font-bold mb-3">Your Panel</h4>
              <ComicPanel className="aspect-square bg-neutral-light flex flex-col items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-neutral-medium">Generating image...</p>
                  </div>
                ) : generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="Generated panel" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <>
                    <i className="ri-image-add-line text-4xl mb-2 text-neutral-medium"></i>
                    <p className="text-sm text-neutral-medium text-center">Generate an image using<br/>the prompt below</p>
                  </>
                )}
              </ComicPanel>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-comic font-bold">Write your prompt</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="min-h-[100px] border-2 border-black shadow-comic-sm focus:ring-2 focus:ring-primary"
                        placeholder="Describe what happens next in the story..."
                      />
                    </FormControl>
                    <p className="text-xs text-neutral-medium">Be descriptive and creative! Your prompt will generate the next panel's image.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-comic font-bold">Panel caption (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="border-2 border-black shadow-comic-sm focus:ring-2 focus:ring-primary"
                        placeholder="Add dialog or narration text..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between">
                <ComicButton
                  type="button"
                  className="bg-white"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <i className="ri-refresh-line mr-2"></i> 
                  {generatedImage ? "Regenerate" : "Generate"}
                </ComicButton>
                
                <ComicButton
                  type="submit"
                  className="bg-primary text-white"
                  disabled={!generatedImage || submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Panel"}
                </ComicButton>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
