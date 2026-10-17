import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeDraft, selectUniversalApks } from '../tools/publish_play_release.mjs';

const config = { versionName: '0.1.0', versionCodes: { arm: 1001, arm64: 1002 } };

test('internal drafting preserves the current release and cannot target production', () => {
  const current = { name: 'Previous', versionCodes: ['900'], status: 'completed' };
  const result = mergeDraft({ track: 'tv:internal', releases: [current] }, config);
  assert.deepEqual(result.releases[0], current);
  assert.equal(result.releases[1].status, 'draft');
  assert.deepEqual(result.releases[1].versionCodes, ['1001', '1002']);
  for (const track of ['production', 'tv:production', 'beta', 'tv:beta']) {
    assert.throws(() => mergeDraft({ track }, config), /Only internal/);
  }
  assert.throws(() => mergeDraft({ track: 'internal', releases: [
    { status: 'draft', versionCodes: ['950'] },
  ] }, config), /refusing to overwrite/);
  assert.deepEqual(mergeDraft(result, config), result);
});

test('GitHub APKs require an unambiguous common Play signing identity', () => {
  const group = (certificate, id) => ({ certificateSha256Hash: certificate,
    generatedUniversalApk: { downloadId: id } });
  const first = group('a'.repeat(64), 'arm');
  const second = group('a'.repeat(64), 'arm64');
  assert.deepEqual(selectUniversalApks([{ generatedApks: [first] }, { generatedApks: [second] }]), [first, second]);
  assert.throws(() => selectUniversalApks([
    { generatedApks: [first] }, { generatedApks: [group('b'.repeat(64), 'other-key')] },
  ]), /unambiguous/);
  const ambiguous = [first, group('b'.repeat(64), 'another-key')];
  assert.throws(() => selectUniversalApks([{ generatedApks: ambiguous }, { generatedApks: ambiguous }]), /unambiguous/);
  assert.throws(() => selectUniversalApks([{ generatedApks: [{ certificateSha256Hash: 'a'.repeat(64) }] }, { generatedApks: [second] }]), /unambiguous/);
});
