import { createAdminClient } from '@/lib/supabase/admin';
import { runScan } from './scan';

export async function runVerification(briefId: string): Promise<{ resolved: boolean; evidence: string }> {
  const adminClient = createAdminClient();
  
  // Get the brief
  const { data: brief, error: briefError } = await adminClient
    .from('fix_briefs')
    .select('*, projects(*)')
    .eq('id', briefId)
    .single();
    
  if (briefError || !brief) {
    throw new Error('Brief not found');
  }
  
  // Get the original result to find the keyword
  const { data: originalResult } = await adminClient
    .from('query_results')
    .select('*, keywords(*)')
    .eq('id', brief.result_id)
    .single();
    
  if (!originalResult || !originalResult.keywords) {
    throw new Error('Original result not found');
  }
  
  const keyword = originalResult.keywords;
  const project = brief.projects;
  
  // Re-run scan for this specific keyword
  // For simplicity, we'll trigger a full scan but check if this brief's keyword now has mentions
  await runScan(project.id);
  
  // Check if brand is now mentioned
  const { data: newResults } = await adminClient
    .from('query_results')
    .select('*, mentions(*)')
    .eq('run_id', (await adminClient.from('scan_runs').select('id').eq('project_id', project.id).order('started_at', { ascending: false }).limit(1).single()).data?.id)
    .eq('keyword_id', keyword.id);
    
  const hasMention = (newResults || []).some((r: any) => (r.mentions || []).length > 0);
  
  const evidence = hasMention 
    ? `Brand now mentioned in ${newResults?.filter((r: any) => (r.mentions || []).length > 0).length} of ${newResults?.length} queries`
    : 'Brand still not mentioned in AI answers';
  
  // Write verification run
  await adminClient.from('verification_runs').insert({
    brief_id: briefId,
    resolved: hasMention,
    evidence,
  });
  
  return { resolved: hasMention, evidence };
}