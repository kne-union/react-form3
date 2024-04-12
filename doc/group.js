const { default: ReactForm, useField, useSubmit, useReset, GroupList } = _ReactForm;
const { useRef } = React;

const Input = props => {
  const fieldProps = useField(props);

  return (<div>
    {fieldProps.label}
    <input ref={fieldProps.fieldRef} type="text" value={fieldProps.value || ''} onChange={fieldProps.onChange}
           onBlur={fieldProps.triggerValidate} />
    {fieldProps.errState}
    {fieldProps.errMsg}
  </div>);
};

const SubmitButton = ({ children }) => {
  const { isLoading, onClick } = useSubmit();
  return (<button onClick={onClick}>
    {children}
    {isLoading ? '正在提交中...' : ''}
  </button>);
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <button onClick={onClick}>重置</button>;
};

const BaseExample = () => {
  const ref = useRef();
  const formApiRef = useRef();
  return <div>
    <div>
      <button onClick={() => {
        formApiRef.current.setField({
          name: 'name', groupName: 'group', groupIndex: 0, value: '设置group字段值'
        });
      }}>
        设置group第一项name字段值
      </button>
      <button onClick={() => {
        formApiRef.current.setField({
          name: 'name', groupName: 'group', value: '设置group字段值'
        });
      }}>
        设置group所有项name字段值
      </button>
      <button onClick={() => {
        formApiRef.current.setField({
          groupName: 'group', groupIndex: 0, value: {
            name: '名称', des: '说明'
          }
        });
      }}>
        设置group第一项所有字段值
      </button>
      <button onClick={() => {
        formApiRef.current.setFormData({
          group: [{ name: '第一项' }, { name: '第二项' }, { name: '第三项' }, { name: '第四项' }, { name: '第五项' }]
        });
      }}>设置整个表单的值
      </button>
    </div>
    <ReactForm ref={formApiRef} debug onSubmit={(data) => {
      console.log('submit:', data);
    }}>
      <div>
        <button onClick={() => {
          ref.current.onAdd();
        }}>倒序添加
        </button>
      </div>
      <GroupList ref={ref} name="group">{({ index, onRemove }) => {
        return <div>
          <div>第{index + 1}项</div>
          <Input name="name" label="名称" rule="REQ LEN-0-10" onChange={() => {
            console.log(index);
          }} />
          <Input name="des" label="描述" rule="LEN-0-10" />
          <GroupList name="inner">{({ index, onRemove }) => {
            return <div style={{
              padding: '10px', background: '#eee'
            }}>
              <div>第{index + 1}项</div>
              <Input name="name" label="名称" rule="LEN-0-10" />
              <Input name="des" label="描述" rule="LEN-0-10" />
              <button onClick={() => {
                onRemove();
              }}>删除子GroupItem
              </button>
            </div>;
          }}</GroupList>
          <button onClick={() => {
            onRemove();
          }}>删除
          </button>
        </div>;
      }}</GroupList>
      <button onClick={() => {
        ref.current.onAdd({ isUnshift: false });
      }}>顺序添加
      </button>
      <div>
        <SubmitButton>提交</SubmitButton>
        <ResetButton>重置</ResetButton>
      </div>
    </ReactForm>
  </div>;
};

render(<BaseExample />);
