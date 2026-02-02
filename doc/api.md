### Form 组件 API

#### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| data | 表单初始值 | object | {} |
| rules | 自定义验证规则 | object | {} |
| interceptors | 表单拦截器配置 | object | {} |
| debug | 是否开启调试模式 | boolean | false |
| noFilter | 是否关闭空值过滤 | boolean | false |
| onPrevSubmit | 提交前回调 | function(values, form) | - |
| onSubmit | 提交回调 | function(values) | Promise |
| onError | 错误回调 | function(errors) | - |
| onFormDataChange | 表单数据变化回调 | function(formData) | - |
| children | 表单内容 | React.ReactNode | - |

#### Ref 暴露的方法

| 方法名 | 说明 | 参数 | 返回值 |
|-----|----|----|-----|
| submit | 提交表单 | - | void |
| data | 获取表单数据 | - | object |
| set data(data) | 设置表单数据 | object | void |
| reset | 重置表单 | - | void |
| errors | 获取错误信息 | - | array |
| isPass | 表单是否通过验证 | - | boolean |
| setFormData | 设置表单数据 | (data, runValidate?) | void |
| getFormData | 获取表单数据 | - | object |
| setFields | 批量设置字段属性 | (fields, options?) | void |
| setField | 设置单个字段属性 | (field, options?) | void |
| setFieldValue | 设置字段值 | (target, value, options?) | void |
| setFieldValidate | 设置字段验证状态 | (target, validate) | void |
| getField | 获取指定字段 | (target) | Field |
| getFields | 获取匹配的字段列表 | (target) | Field[] |
| validateField | 验证指定字段 | (target) | void |
| validateAll | 验证所有字段 | - | void |
| onReady | 表单就绪回调 | callback | - |
| onDestroy | 表单销毁回调 | callback | - |

### useField Hook API

#### 参数

| 参数名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| name | 字段名称 | string | - |
| label | 字段标签 | string | - |
| rule | 验证规则字符串 | string | - |
| interceptor | 字段拦截器配置 | object | {} |
| associations | 字段关联配置 | object | {} |
| noTrim | 是否不自动去空格 | boolean | false |
| debounce | 防抖延迟时间 | number | 0 |
| defaultValue | 默认值 | any | - |
| errMsg | 自定义错误信息 | string | - |
| onChange | 值变化回调 | function(value) | - |

#### 返回值

| 属性名 | 说明 | 类型 |
|-----|----|----|
| id | 字段唯一标识 | string |
| name | 字段名称 | string |
| label | 字段标签 | string |
| value | 字段值 | any |
| fieldRef | 字段 ref | RefObject |
| formData | 表单数据 | object |
| formState | 表单状态 | Map |
| rule | 验证规则 | string |
| groupName | 分组名称 | string |
| groupIndex | 分组索引 | number |
| onChange | 值变化处理函数 | function |
| isValueChanged | 是否值已改变 | boolean |
| triggerValidate | 触发验证 | function |
| associationOptions | 关联选项 | object |
| errState | 错误状态 (0未验证, 1通过, 2错误, 3验证中) | number |
| errMsg | 错误信息 | string |

### useSubmit Hook API

#### 返回值

| 属性名 | 说明 | 类型 |
|-----|----|----|
| isLoading | 是否正在提交 | boolean |
| isPass | 表单是否通过验证 | boolean |
| onClick | 提交点击处理函数 | function |

### useReset Hook API

#### 返回值

| 属性名 | 说明 | 类型 |
|-----|----|----|
| onClick | 重置点击处理函数 | function |

### useFormApi Hook API

#### 返回值

与 Form 组件 ref 暴露的方法相同，返回 openApi 对象。

### Group 组件 API

#### 属性

| 属性名 | 说明 | 类型 |
|-----|----|----|
| id | 分组唯一标识 | string |
| name | 分组名称 | string |
| defaultValue | 分组默认值 | object |
| children | 渲染函数 | function({ id, name, group, index }) |

#### children 参数

| 参数名 | 说明 | 类型 |
|-----|----|----|
| id | 分组唯一标识 | string |
| name | 完整分组名称 | string |
| group | 分组数据 | object |
| index | 分组索引 | number |

### GroupList 组件 API

#### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| name | 分组列表名称 | string | - |
| defaultLength | 初始分组数量 | number | 1 |
| empty | 空列表时显示的内容 | ReactNode | - |
| reverseOrder | 是否倒序显示 | boolean | true |
| children | 渲染函数 | function | - |
| ref | ref 对象 | RefObject | - |

#### children 参数

| 参数名 | 说明 | 类型 |
|-----|----|----|
| id | 分组项唯一标识 | string |
| index | 分组项索引 | number |
| length | 分组列表总长度 | number |
| onAdd | 添加分组项 | function(options) |
| onRemove | 删除当前分组项 | function |

#### ref 暴露的方法

| 方法名 | 说明 | 参数 |
|-----|----|----|
| onAdd | 添加分组项 | function({ isUnshift?, defaultValue? }) |
| onRemove | 删除分组项 | function(id) |

### 内置验证规则

| 规则名 | 说明 | 格式 | 示例 |
|-----|----|----|-----|
| REQ | 必填验证 | REQ | rule="REQ" |
| TEL | 手机号验证 | TEL | rule="TEL" |
| EMAIL | 邮箱验证 | EMAIL | rule="EMAIL" |
| LEN | 长度验证 | LEN-{min}-{max} | rule="LEN-3-10" |

#### 验证规则格式说明

- 验证规则通过空格分隔，可组合多个规则
- LEN 规则格式：LEN-{最小长度}-{最大长度}，若最小等于最大则表示精确长度

### 全局拦截器 API

#### 注册拦截器

| 方法名 | 说明 | 参数 | 返回值 |
|-----|----|----|-----|
| interceptors.input.use | 注册输入拦截器 | (name, function) | number |
| interceptors.output.use | 注册输出拦截器 | (name, function) | number |

#### 使用示例

```javascript
import { interceptors } from '@kne/react-form';

// 注册输入拦截器（在值存入表单前执行）
interceptors.input.use('trim', value => value.trim());
interceptors.input.use('number', value => Number(value));

// 注册输出拦截器（在值从表单取出时执行）
interceptors.output.use('formatDate', value => {
  return value ? new Date(value).toISOString() : value;
});
```
