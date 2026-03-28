import qs from 'qs'
// 1. 导入axios
import axios from 'axios'
// 2. 创建axios的实例
//通过调用axios的create方法来创建axios的实例
//request 变量名。const声明变量
const request = axios.create({
    // 通过开发代理转发到后端 http://localhost:8088
    baseURL:'/api',
    timeout:30000
})
//3. 封装我们axios方法
//封装get方法
export const reqGet=function(url,params){
    return request({
        url,
        method:'get',
        params
    })
}
// 封装post方法。默认传递json格式的数据，后端需要使用参数级别的注解@RequestBody
export const reqPostJson=function(url,data,params){
    return request({
        url,
        method:'post',
        data,
        params
    })
}
// 新增：封装put方法，传递json
export const reqPutJson=function(url,data,params){
    return request({
        url,
        method:'put',
        data,
        params
    })
}
// 新增：封装delete方法
export const reqDelete=function(url,params){
    return request({
        url,
        method:'delete',
        params
    })
}
//封装post方法。后端不使用参数级别的注解的话，前端就需要给后端传递form格式的数据 qs
export const reqPostForm=function(url,data,params){
    return request({
        url,
        method:'post',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data:qs.stringify(data),
        params
    })
}

