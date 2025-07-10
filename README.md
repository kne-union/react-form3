
# react-form


### 描述

用于表单的校验


### 安装

```shell
npm i --save @kne/react-form
```


### 概述

react-form是一个功能强大的React表单库，提供了完整的表单状态管理、验证和提交解决方案。

### 核心特性

#### 状态管理
- 使用React的状态管理机制管理表单状态
- 支持复杂的表单状态结构
- 提供表单状态的实时更新和访问

#### 事件系统
- 使用事件发射器模式实现表单内部通信
- 支持多种表单事件，如提交、验证、重置等
- 允许自定义事件处理逻辑

#### 字段管理
- 动态添加、更新和移除表单字段
- 支持字段级别的状态管理
- 提供字段值的获取和设置方法

#### 验证系统
- 支持表单和字段级别的验证
- 提供内置验证规则
- 支持自定义验证逻辑
- 实时验证和提交验证

#### 数据处理
- 支持表单数据的获取、设置和重置
- 提供数据转换和格式化功能
- 支持初始数据设置

#### 分组管理
- 支持表单字段的分组
- 允许动态添加和移除分组
- 支持分组级别的操作和验证

### 架构设计

#### 组件结构
- Form：表单的主要容器，负责状态管理和上下文提供
- Field：表单字段组件，负责单个字段的渲染和交互
- Group：表单分组组件，用于管理相关字段的集合
- GroupList：动态分组列表，支持添加和移除分组

#### 核心模块
- 事件系统：处理表单内部的事件通信
- 验证系统：处理表单和字段的验证逻辑
- 拦截器：提供表单操作的拦截和修改能力
- 任务系统：管理表单的异步任务

### 使用场景

- 复杂表单开发
- 动态表单生成
- 表单验证和提交
- 多步骤表单流程
- 表单数据管理


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
- _ReactForm(@kne/current-lib_react-form)

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
    <ReactForm debug data={{
      name: '哈哈哈'
    }} onSubmit={async (data) => {
      await new Promise((resolve)=>{
        setTimeout(() => {
          resolve();
        },3000);
      });
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
- _ReactForm(@kne/current-lib_react-form),antd(antd)

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

- use-form-api
- 展示useFormApi的使用
- _ReactForm(@kne/current-lib_react-form),antd(antd)

```jsx
const { default: ReactForm, useField, useSubmit, useReset, useFormApi } = _ReactForm;
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

const Options = () => {
  const { openApi: formApi } = useFormApi();

  console.log(formApi);

  return <Space>
    <Button onClick={() => {
      console.log(formApi.getFormData());
    }}>获取表单值</Button>
    <Button onClick={() => {
      formApi.setField({ name: 'name', value: '哈哈哈' });
    }}>设置字段值</Button>
    <Button onClick={() => {
      formApi.setFields([{ name: 'name', value: '哈哈哈' }, {
        name: 'name2', value: '哈哈哈2'
      }, { name: 'name3', value: '哈哈哈3' }]);
    }}>设置多个字段值</Button>
    <Button onClick={() => {
      formApi.setFieldValidate({
        name: 'name2', validate: { status: 2, msg: '我是一个通过api设置的错误' }
      });
    }}>设置校验信息</Button>
  </Space>;
};

const BaseExample = () => {
  const formApiRef = useRef();
  return <div>
    <ReactForm ref={formApiRef}>
      <div><Options /></div>
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
- _ReactForm(@kne/current-lib_react-form),antd(antd)

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
    <ReactForm ref={formApiRef} onSubmit={(data) => {
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

```

- associations
- 字段关联关系
- _ReactForm(@kne/current-lib_react-form),antd(antd)

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
    <ReactForm debug onSubmit={(data) => {
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
          openApi.setFieldValue(target, (group || []).filter((item) => item.sum > 0).reduce((a, b) => a + parseInt(b.sum), 0));
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

- 基本示例
- 简单的form到input组件的绑定
- _ReactForm(@kne/current-lib_react-form)

```jsx
const { default: ReactForm, useField, useSubmit, useReset } = _ReactForm;

const Input = props => {
  const fieldProps = useField(props);

  return (
    <div>
      {fieldProps.label}
      <input ref={fieldProps.fieldRef} type="text" value={fieldProps.value || ''} onChange={fieldProps.onChange} onBlur={fieldProps.triggerValidate} />
      {fieldProps.errState}
      {fieldProps.errMsg}
    </div>
  );
};

const SubmitButton = ({ children }) => {
  const { isLoading, onClick } = useSubmit();
  return (
    <button onClick={onClick}>
      {children}
      {isLoading ? '正在提交中...' : ''}
    </button>
  );
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <button onClick={onClick}>重置</button>;
};

const BaseExample = () => {
  return (
    <div>
      <ReactForm
        debug
        rules={{
          REMOTE_RULE: async value => {
            console.log('>>>>>start');
            await new Promise(resolve => {
              setTimeout(() => {
                resolve();
              }, 1000);
            });
            console.log('>>>>>>>>end');
            return { result: true };
          }
        }}
        data={{
          name: '哈哈哈'
        }}
        onSubmit={async data => {
          console.log('>>>>>>>>>>>>>>>');
          await new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 3000);
          });
          console.log('submit:', data);
        }}>
        <Input name="name" label="名称" rule="REQ REMOTE_RULE" />
        <div>
          <SubmitButton>提交</SubmitButton>
          <ResetButton>重置</ResetButton>
        </div>
      </ReactForm>
    </div>
  );
};

render(<BaseExample />);

```


### API

### Form组件API

#### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| initialValues | 表单初始值 | object | {} |
| onSubmit | 表单提交回调函数 | function(values, form) | - |
| onSubmitFail | 表单提交失败回调函数 | function(errors, form) | - |
| onReset | 表单重置回调函数 | function(form) | - |
| onValidate | 表单验证回调函数 | function(values, form) | - |
| interceptors | 表单拦截器 | object | {} |
| children | 表单内容 | React.ReactNode | - |

#### 示例

```jsx
import { Form, Field } from 'react-form';

const MyForm = () => {
  const handleSubmit = (values) => {
    console.log('Form values:', values);
  };

  return (
    <Form
      initialValues={{ name: 'John', email: '' }}
      onSubmit={handleSubmit}
    >
      <Field name="name" label="Name" />
      <Field name="email" label="Email" />
      <button type="submit">Submit</button>
    </Form>
  );
};
```

### useOpenApi钩子API

useOpenApi钩子提供了一组用于操作表单的方法。

#### 返回值

| 方法名 | 说明 | 参数 | 返回值 |
|-----|----|----|-----|
| getValues | 获取表单所有字段的值 | - | object |
| getValue | 获取指定字段的值 | (name: string) | any |
| setValues | 设置表单多个字段的值 | (values: object, runValidate?: boolean) | void |
| setValue | 设置指定字段的值 | (name: string, value: any, runValidate?: boolean) | void |
| setFields | 设置表单字段的属性 | (fields: array, runValidate?: boolean) | void |
| resetFields | 重置表单字段 | - | void |
| submit | 提交表单 | - | Promise |
| validate | 验证表单 | (names?: string[]) | Promise<boolean> |
| getFieldError | 获取指定字段的错误信息 | (name: string) | string |
| getErrors | 获取表单所有字段的错误信息 | - | object |
| isFieldTouched | 判断字段是否被用户操作过 | (name: string) | boolean |
| isFieldValidating | 判断字段是否正在验证 | (name: string) | boolean |
| getFieldsValue | 获取多个字段的值 | (nameList: string[]) | object |

#### 示例

```jsx
import { Form, useOpenApi } from 'react-form';

const FormWithApi = () => {
  const formApi = useOpenApi();
  
  const handleClick = () => {
    formApi.setValue('name', 'New Name');
    console.log(formApi.getValues());
  };

  return (
    <Form>
      <Field name="name" label="Name" />
      <Field name="email" label="Email" />
      <button type="button" onClick={handleClick}>
        Update Name
      </button>
      <button type="submit">Submit</button>
    </Form>
  );
};
```

### Field组件API

#### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| name | 字段名称 | string | - |
| label | 字段标签 | string | - |
| defaultValue | 默认值 | any | - |
| rules | 验证规则 | array | [] |
| children | 自定义渲染函数 | function(field) | - |
| onChange | 值变化回调 | function(value, field) | - |
| onBlur | 失焦回调 | function(e, field) | - |
| onFocus | 聚焦回调 | function(e, field) | - |

#### 示例

```jsx
import { Form, Field } from 'react-form';

const MyForm = () => {
  return (
    <Form>
      <Field
        name="username"
        label="Username"
        defaultValue=""
        rules={[
          { required: true, message: 'Please input your username!' },
          { min: 3, message: 'Username must be at least 3 characters' }
        ]}
      >
        {({ value, onChange, error }) => (
          <div>
            <input value={value} onChange={e => onChange(e.target.value)} />
            {error && <div className="error">{error}</div>}
          </div>
        )}
      </Field>
      <button type="submit">Submit</button>
    </Form>
  );
};
```

### Group组件API

#### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| name | 分组名称 | string | - |
| children | 分组内容 | React.ReactNode | - |

#### GroupList组件属性

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| name | 分组列表名称 | string | - |
| children | 分组模板 | function(index) | - |
| defaultLength | 初始分组数量 | number | 0 |

#### 示例

```jsx
import { Form, Field, Group, GroupList } from 'react-form';

const MyForm = () => {
  return (
    <Form>
      <GroupList name="contacts" defaultLength={1}>
        {(index) => (
          <Group name={index}>
            <Field name="name" label="Name" />
            <Field name="phone" label="Phone" />
          </Group>
        )}
      </GroupList>
      <button type="button" onClick={() => formApi.addGroup('contacts')}>
        Add Contact
      </button>
      <button type="submit">Submit</button>
    </Form>
  );
};
```

### 表单验证规则API

#### 内置规则

| 规则名 | 说明 | 参数类型 | 示例 |
|-----|----|----|-----|
| required | 必填字段 | boolean | { required: true, message: '必填字段' } |
| min | 最小长度/值 | number | { min: 3, message: '最小长度为3' } |
| max | 最大长度/值 | number | { max: 10, message: '最大长度为10' } |
| pattern | 正则表达式匹配 | RegExp | { pattern: /^\d+$/, message: '必须为数字' } |
| validator | 自定义验证函数 | function | { validator: (value) => value === 'test' ? '' : '验证失败' } |

#### 示例

```jsx
import { Form, Field } from 'react-form';

const MyForm = () => {
  return (
    <Form>
      <Field
        name="email"
        label="Email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确' }
        ]}
      />
      <Field
        name="password"
        label="Password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码长度不能小于6位' },
          { 
            validator: (value) => {
              if (!/[A-Z]/.test(value)) {
                return '密码必须包含大写字母';
              }
              return '';
            }
          }
        ]}
      />
      <button type="submit">Submit</button>
    </Form>
  );
};
```

### 表单拦截器API

拦截器可以在表单操作的不同阶段进行拦截和修改。

#### 可用拦截器

| 拦截器名 | 说明 | 参数 | 返回值 |
|-----|----|----|-----|
| beforeSubmit | 表单提交前拦截 | (values, form) | values或Promise |
| afterSubmit | 表单提交后拦截 | (result, form) | result或Promise |
| beforeValidate | 表单验证前拦截 | (values, form) | values或Promise |
| afterValidate | 表单验证后拦截 | (errors, form) | errors或Promise |
| beforeReset | 表单重置前拦截 | (form) | void或Promise |
| afterReset | 表单重置后拦截 | (form) | void或Promise |

#### 示例

```jsx
import { Form, Field } from 'react-form';

const MyForm = () => {
  const interceptors = {
    beforeSubmit: (values) => {
      console.log('Before submit:', values);
      // 可以修改values
      return {
        ...values,
        timestamp: Date.now()
      };
    },
    afterSubmit: (result) => {
      console.log('After submit:', result);
      return result;
    }
  };

  return (
    <Form
      interceptors={interceptors}
      onSubmit={(values) => console.log('Submit:', values)}
    >
      <Field name="name" label="Name" />
      <Field name="email" label="Email" />
      <button type="submit">Submit</button>
    </Form>
  );
};
```

