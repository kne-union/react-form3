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
