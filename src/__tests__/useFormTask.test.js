import { act } from 'react';
import useFormTask, { FORM_TASK_STATE_ENUM } from '../Form/useFormTask';
import { renderHook } from '../test-utils/renderHook';

describe('useFormTask', () => {
  test('append 期间 PENDING，全部完成后 COMPLETE', async () => {
    const { result, unmount } = renderHook(useFormTask);
    expect(result.current.state).toBe(FORM_TASK_STATE_ENUM.COMPLETE);

    let release;
    const blocker = new Promise(resolve => {
      release = resolve;
    });

    await act(async () => {
      result.current.append('v1', () => blocker);
    });
    expect(result.current.state).toBe(FORM_TASK_STATE_ENUM.PENDING);

    await act(async () => {
      release();
      await result.current.target;
    });
    expect(result.current.state).toBe(FORM_TASK_STATE_ENUM.COMPLETE);
    unmount();
  });

  test('同 id 再次 append 会 cancel 旧任务', async () => {
    const { result, unmount } = renderHook(useFormTask);
    let firstDone = false;

    await act(async () => {
      result.current.append('same', async () => {
        await new Promise(resolve => setTimeout(resolve, 30));
        firstDone = true;
      });
      result.current.append('same', async () => {});
      await result.current.target;
    });

    expect(firstDone).toBe(false);
    expect(result.current.state).toBe(FORM_TASK_STATE_ENUM.COMPLETE);
    unmount();
  });

  test('expire 取消未完成任务', async () => {
    const { result, unmount } = renderHook(useFormTask);

    await act(async () => {
      result.current.append('v1', () => new Promise(() => {}));
    });
    expect(result.current.state).toBe(FORM_TASK_STATE_ENUM.PENDING);

    await act(async () => {
      result.current.expire('v1');
    });
    expect(result.current.state).toBe(FORM_TASK_STATE_ENUM.COMPLETE);
    unmount();
  });

  test('expire 不存在的 id 不抛错', () => {
    const { result, unmount } = renderHook(useFormTask);
    expect(() => result.current.expire('missing')).not.toThrow();
    unmount();
  });
});
