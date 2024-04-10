
# react-form


### 描述

用于表单的校验


### 安装

```shell
npm i --save @kne/react-form
```

### 示例


#### 示例样式

```scss
.ant-card {
  border-color: black;
  text-align: center;
  width: 200px;
}
```

#### 示例代码

- 基本示例
- 简单的form到input组件的绑定
- _ReactForm(@kne/current-lib)

```jsx
const { default: ReactForm, useField, useSubmit, useReset } = _ReactForm;

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
  return <div>
    <ReactForm data={{
      name: '哈哈哈'
    }} onSubmit={(data) => {
      console.log('submit:', data);
    }}>
      <Input name="name" label="名称" rule="REQ LEN-0-10" />
      <div>
        <SubmitButton>提交</SubmitButton>
        <ResetButton>重置</ResetButton>
      </div>
    </ReactForm>
  </div>;
};

render(<BaseExample />);

```

- openApi
- 展示openApi的使用
- _ReactForm(@kne/current-lib),antd(antd)

```jsx
const { default: ReactForm, useField, useSubmit, useReset } = _ReactForm;
const { useRef } = React;
const { Button, Space } = antd;

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
  const formApiRef = useRef();
  return <div>
    <Space>
      <Button onClick={() => {
        console.log(formApiRef.current.data);
      }}>获取表单值</Button>
      <Button onClick={() => {
        formApiRef.current.setField({ name: 'name', value: '哈哈哈' });
      }}>设置字段值</Button>
      <Button onClick={() => {
        formApiRef.current.setFields([{ name: 'name', value: '哈哈哈' }, {
          name: 'name2', value: '哈哈哈2'
        }, { name: 'name3', value: '哈哈哈3' }]);
      }}>设置多个字段值</Button>
      <Button onClick={() => {
        formApiRef.current.setFieldValidate({
          name: 'name2', validate: { status: 2, msg: '我是一个通过api设置的错误' }
        });
      }}>设置校验信息</Button>
    </Space>
    <ReactForm ref={formApiRef}>
      <Input name="name" label="名称" rule="REQ LEN-0-10" />
      <Input name="name2" label="名称2" rule="REQ LEN-0-10" />
      <Input name="name3" label="名称3" rule="REQ LEN-0-10" />
      <div>
        <SubmitButton>提交</SubmitButton>
        <ResetButton>重置</ResetButton>
      </div>
    </ReactForm>
  </div>;
};

render(<BaseExample />);

```

- group
- 展示group的使用
- _ReactForm(@kne/current-lib),antd(antd)

```jsx
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
          <Input name="name" label="名称" rule="REQ LEN-0-10" />
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

```

- associations
- 字段关联关系
- _ReactForm(@kne/current-lib),antd(antd)

```jsx
const { default: ReactForm, useField, useSubmit, useReset, GroupList } = _ReactForm;

const { useRef } = React;

const Input = props => {
  const fieldProps = useField(props);

  return (<div>
    {fieldProps.label}
    <input {...fieldProps.associationOptions} ref={fieldProps.fieldRef} type="text" value={fieldProps.value || ''}
           onChange={fieldProps.onChange}
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
  const ref = useRef(null);
  return <div>
    <ReactForm onSubmit={(data) => {
      console.log('submit:', data);
    }}>
      <Input name="name" label="名称" rule="REQ LEN-0-10" />
      <Input name="des" label="描述" rule="LEN-0-10" associations={{
        fields: [{
          name: 'name'
        }], callback: ({ target, origin, openApi }) => {
          openApi.setFieldValue(target, origin.value);
        }
      }} />
      <hr />
      <Input name="familyName" label="姓" rule="REQ LEN-0-10" />
      <Input name="firstName" label="名" rule="REQ LEN-0-10" />
      <Input name="fullName" label="全名" rule="REQ LEN-0-20" associations={{
        fields: [{
          name: 'familyName'
        }, {
          name: 'firstName'
        }], callback: ({ target, openApi }) => {
          const { firstName, familyName } = openApi.getFormData();
          openApi.setFieldValue(target, firstName && firstName ? `${firstName} ${familyName}` : '');
        }
      }} />
      <hr />
      <Input name="money" label="金额" />
      <Input name="ratio" label="比例" />
      <Input name="all" label="总金额" associations={{
        fields: [{
          name: 'money'
        }, {
          name: 'ratio'
        }], callback: ({ target, openApi }) => {
          const { money, ratio } = openApi.getFormData();
          openApi.setFieldValue(target, money && ratio && ratio > 0 ? money / ratio : '');
        }
      }} />
      <hr />
      <div>
        <button onClick={() => {
          ref.current.onAdd();
        }}>添加
        </button>
      </div>
      <GroupList ref={ref} name="group" defaultLength={1}>{({ index, onRemove }) => {
        return <div>
          <div>第{index + 1}项</div>
          <Input name="sum" label="数量" />
          <button onClick={() => {
            onRemove();
          }}>删除
          </button>
        </div>;
      }}</GroupList>
      <Input name="amount" label="总数" associations={{
        fields: [{
          name: 'sum', groupName: 'group'
        }], callback: ({ target, openApi }) => {
          const { group } = openApi.getFormData();
          openApi.setFieldValue(target, group.filter((item) => item.sum > 0).reduce((a, b) => a + parseInt(b.sum), 0));
        }
      }} />
      <div>
        <SubmitButton>提交</SubmitButton>
        <ResetButton>重置</ResetButton>
      </div>
    </ReactForm>
  </div>;
};

render(<BaseExample />);

```


### API

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
|     |    |    |     |

