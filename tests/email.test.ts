import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Resend so we never hit the network
const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: (...args: any[]) => sendMock(...args) };
  },
}));

// Mock the admin client so we control profile lookups
const fromMock = vi.fn();
const selectMock = vi.fn();
const singleMock = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (...args: any[]) => {
      fromMock(...args);
      return {
        select: (...sArgs: any[]) => {
          selectMock(...sArgs);
          return {
            eq: () => ({ single: () => singleMock() }),
          };
        },
      };
    },
  }),
}));

// First single() call resolves the project lookup, second resolves the profile
function queueSingle(...values: any[]) {
  let i = 0;
  singleMock.mockImplementation(() =>
    Promise.resolve(values[i++ % values.length])
  );
}

import { sendScanCompletion, sendExecutiveWeeklyDigest } from '../src/lib/email';

const basePayload = {
  projectId: 'proj-1',
  domain: 'example.com',
  visibilityScore: 72,
  shareOfVoice: 64,
  totalMentions: 12,
  competitorMentions: 7,
  keywordsCovered: 8,
  keywordsTotal: 10,
  topGaps: ['no_mention: "best crm tools"'],
};

beforeEach(() => {
  sendMock.mockReset();
  fromMock.mockReset();
  selectMock.mockReset();
  singleMock.mockReset();
});

describe('sendScanCompletion', () => {
  it('sends a completion email when the user has an email address', async () => {
    queueSingle(
      { data: { user_id: 'user-1' }, error: null },
      { data: { email: 'user@example.com' }, error: null }
    );

    await sendScanCompletion(basePayload);

    expect(fromMock).toHaveBeenCalledWith('projects');
    expect(singleMock).toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledTimes(1);

    const [args] = sendMock.mock.calls[0];
    expect(args.to).toBe('user@example.com');
    expect(args.subject).toContain('example.com');
    expect(args.html).toContain('72');
    expect(args.html).toContain('64%');
    expect(args.html).toContain('best crm tools');
  });

  it('skips sending when the project has no user', async () => {
    queueSingle({ data: null, error: null });

    await sendScanCompletion(basePayload);

    expect(sendMock).not.toHaveBeenCalled();
  });

  it('skips sending when the profile has no email', async () => {
    queueSingle(
      { data: { user_id: 'user-1' }, error: null },
      { data: { email: null }, error: null }
    );

    await sendScanCompletion(basePayload);

    expect(sendMock).not.toHaveBeenCalled();
  });

  it('does not throw when Resend fails', async () => {
    singleMock.mockResolvedValue({ data: { email: 'user@example.com' }, error: null });
    sendMock.mockRejectedValue(new Error('Resend down'));

    await expect(sendScanCompletion(basePayload)).resolves.toBeUndefined();
  });

  it('sends an executive weekly digest email with rich metrics and delta badge', async () => {
    sendMock.mockResolvedValueOnce({ id: 'msg-123' });

    const res = await sendExecutiveWeeklyDigest({
      to: 'client@company.com',
      projectId: 'proj-1',
      domain: 'revolut.com',
      brandName: 'Revolut',
      visibilityScore: 84,
      scoreDelta: 6,
      shareOfVoice: 62,
      totalMentions: 38,
      keywordsCovered: 9,
      keywordsTotal: 10,
      topGaps: ['Missing pricing citation on ChatGPT'],
      verifiedFactsCount: 4,
    });

    expect(res.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const [args] = sendMock.mock.calls[0];
    expect(args.to).toBe('client@company.com');
    expect(args.subject).toContain('Revolut Weekly Digest');
    expect(args.html).toContain('84');
    expect(args.html).toContain('+6 pts this week');
    expect(args.html).toContain('62%');
    expect(args.html).toContain('Missing pricing citation on ChatGPT');
  });
});