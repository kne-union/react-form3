import { act, createElement, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Form from '../Form';
import useField from '../Field/useField';

const ExtraInput = () => {
  const field = useField({ name: 'extra' });
  return createElement('input', { 'data-testid': 'extra', value: field.value ?? '', onChange: () => {} });
};

const DataPropApp = () => {
  const [, setTick] = useState(0);
  const [visible, setVisible] = useState(false);
  const formRef = useRef(null);
  const data = { extra: 'from-props' };
  return createElement(
    Form,
    { ref: formRef, data },
    createElement(
      'button',
      {
        type: 'button',
        'data-testid': 'set',
        onClick: () => formRef.current.setFormData({ extra: 'from-set' })
      },
      'set'
    ),
    createElement(
      'button',
      {
        type: 'button',
        'data-testid': 'forget',
        onClick: () => formRef.current.forgetField({ name: 'extra' })
      },
      'forget'
    ),
    createElement('button', { type: 'button', 'data-testid': 'rerender', onClick: () => setTick(x => x + 1) }, 'rerender'),
    createElement('button', { type: 'button', 'data-testid': 'show', onClick: () => setVisible(true) }, 'show'),
    visible ? createElement(ExtraInput) : null
  );
};

const ReadyApp = ({ onReady }) => {
  const formRef = useRef(null);
  return createElement(
    Form,
    {
      ref: formRef,
      onFormDataChange: () => {}
    },
    createElement(
      'button',
      {
        type: 'button',
        'data-testid': 'ready',
        onClick: () => formRef.current.onReady(onReady)
      },
      'ready'
    )
  );
};

const render = element => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
};

describe('Form 修复场景', () => {
  test('data 仅引用变化时不重置 init，晚挂载字段仍读 setFormData', async () => {
    const { container, unmount } = render(createElement(DataPropApp));

    act(() => {
      container.querySelector('[data-testid="set"]').click();
    });
    act(() => {
      container.querySelector('[data-testid="forget"]').click();
    });
    act(() => {
      container.querySelector('[data-testid="rerender"]').click();
    });
    act(() => {
      container.querySelector('[data-testid="show"]').click();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.querySelector('[data-testid="extra"]').value).toBe('from-set');
    unmount();
  });

  test('表单已挂载后再 onReady 会立即回调', () => {
    const onReady = jest.fn();
    const { container, unmount } = render(createElement(ReadyApp, { onReady }));
    act(() => {
      container.querySelector('[data-testid="ready"]').click();
    });
    expect(onReady).toHaveBeenCalledTimes(1);
    unmount();
  });
});
