import { act, createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import Form from '../Form';
import GroupList from '../Group/GroupList';
import useField from '../Field/useField';

const Input = ({ name }) => {
  const field = useField({ name, label: name });
  return createElement('input', {
    'data-name': name,
    'data-index': String(field.groupIndex),
    value: field.value || '',
    onChange: e => field.onChange(e.target.value)
  });
};

const renderExample = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const listRef = createRef();
  const formRef = createRef();
  act(() => {
    root.render(
      createElement(
        Form,
        { ref: formRef, onSubmit: () => {} },
        createElement(GroupList, { name: 'group', defaultLength: 1, reverseOrder: true, ref: listRef }, ({ index }) => createElement('div', { 'data-row': String(index) }, createElement(Input, { name: 'name' })))
      )
    );
  });
  return {
    container,
    listRef,
    formRef,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
};

const valuesByIndex = container => {
  return Array.from(container.querySelectorAll('input[data-name="name"]')).reduce((result, input) => {
    result[input.getAttribute('data-index')] = input.value;
    return result;
  }, {});
};

describe('动态分组：删中间项后再添加', () => {
  test('新加项应为空，不能带上王五', async () => {
    const { container, listRef, formRef, unmount } = renderExample();
    const ids = [];
    formRef.current.emitter.addListener('form-group:change', ({ list }) => {
      ids.splice(0, ids.length, ...list.map(item => item.id));
    });

    await act(async () => {
      formRef.current.setFormData({
        group: [
          { name: '张三', des: '描述1' },
          { name: '李四', des: '描述2' },
          { name: '王五', des: '描述3' }
        ]
      });
    });
    expect(valuesByIndex(container)).toEqual({ 0: '张三', 1: '李四', 2: '王五' });
    expect(ids).toHaveLength(3);

    await act(async () => {
      listRef.current.onRemove(ids[1]);
    });
    expect(valuesByIndex(container)).toEqual({ 0: '张三', 1: '王五' });

    await act(async () => {
      listRef.current.onAdd();
    });
    expect(valuesByIndex(container)['2']).toBe('');
    expect(valuesByIndex(container)).toEqual({ 0: '张三', 1: '王五', 2: '' });
    unmount();
  });

  test('initFormData 未裁剪时，添加也不应读到越界的王五', async () => {
    const { container, listRef, formRef, unmount } = renderExample();
    const ids = [];
    formRef.current.emitter.addListener('form-group:change', ({ list }) => {
      ids.splice(0, ids.length, ...list.map(item => item.id));
    });
    await act(async () => {
      formRef.current.setFormData({
        group: [{ name: '张三' }, { name: '李四' }, { name: '王五' }]
      });
    });
    await act(async () => {
      listRef.current.onRemove(ids[1]);
    });
    await act(async () => {
      listRef.current.onAdd();
    });
    expect(container.querySelector('input[data-index="2"]').value).toBe('');
    unmount();
  });
});
