<template>
    <div>
        选择市级职能部门&nbsp;
        <Select v-model="search_funcDep" style="width:130px">
            <Option v-for="item in departments" :value="item.depId" :key="item.depId">{{ item.name }}</Option>
        </Select>
        选择区县&nbsp;
        <Select v-model="search_county" style="width:130px">
            <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        单位名称&nbsp;
        <Input v-model="search_orgName" placeholder="请输入单位名称" style="width: 150px" />
        <Button class="button-mar" icon="ios-search" type="primary" @click="accSearch">查询</Button>
        <Upload class="view-upload button-mar" action="" :before-upload="handleBeforeUpload" accept=".xls, .xlsx">
            <Button icon="ios-cloud-upload-outline" :loading="uploadLoading" @click="handleUploadFile">导入</Button>
        </Upload>
        <Button type="primary" @click="add_open('add')" class="button-mar">新建</Button>
        <Row class="margin-top-10">
            <Table :loading="uploadLoading" border :columns="tableTitle" :data="tableData" >
            <template slot-scope="{ row }" slot="name">
                <strong>{{ row.name }}</strong>
            </template>
            <template slot-scope="{ row, index }" slot="action">
              <Button type="primary" size="small" style="margin-right: 5px" @click="add_open('edit',index)">编辑</Button>
              <Button type="error" size="small" style="margin-right: 5px">人员管理</Button>
              <Button type="error" size="small" >人员扫码记录</Button>
          </template>
        </Table>
        </Row>

        <Modal
        v-model="model3"
        :title="title"
        :mask-closable=false
        >
            <Form ref="formArg" :model="formArg" :rules="ruleformArg" :label-width="120">
                <FormItem label="单位名称：" prop="orgName">
                    <Input v-model="formArg.orgName" placeholder="请输入单位名称..."></Input>
                </FormItem>
                <FormItem label="市级职能部门：" prop="funcDep" v-show="show">
                    <Select v-model="formArg.funcDep" placeholder="请选择市级职能部门">
                        <Option v-for="item in departments" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="所属区县：" prop="county" v-show="show">
                    <Select v-model="formArg.county" placeholder="请选择所属区县">
                        <Option v-for="item in departments" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="上级单位：" prop="superior" v-show="show">
                    <Select v-model="formArg.superior" placeholder="请选择上级单位">
                        <Option v-for="item in departments" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="登录账号：" prop="account">
                    <Input v-model="formArg.account" placeholder="请输入登录账号..." :disabled="!show"></Input>
                </FormItem>
                <FormItem label="登录密码：" prop="accPwd">
                    <Input type="password" v-model="formArg.accPwd" placeholder="请输入登录密码..."></Input>
                </FormItem>
                <FormItem label="确认登录密码：" prop="checkPwd">
                    <Input type="password" v-model="formArg.checkPwd" placeholder="请确认登录密码..."></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="primary" @click="ok">确认</Button>
                <Button @click="cancel">取消</Button>
            </div>
        </Modal>

    </div>
</template>
<script>
import {
  getDepts
} from '@/api/routers'
import excel from '@/libs/excel'
    export default {
        data () {
            return {
                show:true,
                operateType:'',
                title:"新建",
                value:'',
                formArg:{
                    orgName:'',
                    funcDep:'',
                    county:'',
                    superior:'',
                    account:'',
                    accPwd:'',
                    checkPwd:''
                },
                ruleformArg: {
                    orgName: [
                    { required: true, message: '单位名称不能为空', trigger: 'blur' }
                    ],
                    funcDep: [
                    { required: true, message: '请选择市级职能部门', trigger: 'change' }
                    ],
                    county: [
                    { required: true, message: '请选择所属区县', trigger: 'change' }
                    ],
                    superior: [
                    { required: true, message: '请选择上级单位', trigger: 'change' }
                    ],
                    account: [
                    { required: true, message: '登录账号不能为空', trigger: 'blur' }
                    ],
                    accPwd: [
                    { required: true, message: '登录密码不能为空', trigger: 'blur' }
                    ],
                    checkPwd: [
                    { required: true, message: '确认密码不能为空', trigger: 'blur' },
                    {validator: this.valideRePassword, trigger: 'blur'}
                    ]
                },
                
                search_funcDep: '',//搜索职能部门关键字
                search_county: '',//搜索所属区县关键字
                search_orgName:'',//搜索单位名称关键字
                model3: false,
                uploadLoading: false,
                file: null,
                tableData: [],
                tableTitle: [
                    {title: '单位ID',key: 'dwid'},
                    {title: '单位名称',key: 'orgName'},
                    {title: '市级职能部门',key: 'funcDep'},
                    {title: '所属区县',key: 'county'},
                    {title: '单位层级',key: 'dwcj'},
                    {title: '子单位数',key: 'zdws'},
                    {title: '关联人员数',key: 'stdout'},
                    {title: '上级单位',key: 'superior'},
                    {title: '登录账号',key: 'account'},
                    {title: '登录密码',key: 'accPwd'},
                    {
                        title: '操作',
                        slot: 'action',
                        width: 250,
                        align: 'center'
                    }
                ],
                tableLoading: false
            }
        },
        methods: {
            accSearch(){//查询
                var params={
                    search_funcDep:this.search_funcDep,
                    search_county:this.search_county,
                    search_orgName:this.search_orgName
                }
                console.log(params)
            },
            //_type:add新增,edit修改;_index对应表格第_index条数据
            add_open(_type,_index){
                this.operateType=_type
                this.model3 = true
                if(_type=='edit'){
                    this.title='修改'
                    this.formArg=Object.assign({},this.tableData[_index])
                    this.show=false
                }else{
                    this.show=true
                }
            },
            cancel () {
                this.$refs['formArg'].resetFields()
                this.model3 = false
            },
            ok () {
                this.$refs['formArg'].validate((valid) => {
                    if (valid) {
                        if (this.operateType == 'add') {
                            //新增
                            console.log(this.formArg)
                        } else {
                            //修改
                           console.log(this.formArg)
                        }
                    }
                })
                // this.$refs['formArg'].resetFields()
                // this.model3 = false
            },
            valideRePassword (rule, value, callback) {
                if (value !== this.formArg.accPwd) {
                    callback(new Error('两次输入密码不一致'));
                } else {
                    callback();
                }
            },
            loadTableData(){
                this.tableData=[
                    {
                        dwid:"单位ID",
                        orgName:'单位名称',
                        funcDep:'市级职能部门',
                        dwcj:'单位层级',
                        county:'所属区县',
                        stdout:111,
                        superior:'上级单位',
                        account:'rere',
                        accPwd:'stdrerereout'
                    }
                ]
            },
            initUpload () {
                this.file = null
                // this.showProgress = false
                // this.loadingProgress = 0
                this.tableData = []
                this.tableTitle = []
            },
            handleUploadFile () {
                this.initUpload()
            },
            handleRemove () {
                this.initUpload()
                this.$Message.info('上传的文件已删除！')
            },
            handleBeforeUpload (file) {
                const fileExt = file.name.split('.').pop().toLocaleLowerCase()
                if (fileExt === 'xlsx' || fileExt === 'xls') {
                    this.readFile(file)
                    this.file = file
                } else {
                    this.$Notice.warning({
                    title: '文件类型错误',
                    desc: '文件：' + file.name + '不是EXCEL文件，请选择后缀为.xlsx或者.xls的EXCEL文件。'
                    })
                }
                return false
            },
            // 读取文件
            readFile (file) {
                const reader = new FileReader()
                reader.readAsArrayBuffer(file)
                reader.onloadstart = e => {
                    this.uploadLoading = true
                    this.tableLoading = true
                    // this.showProgress = true
                }
                // reader.onprogress = e => {
                //     this.progressPercent = Math.round(e.loaded / e.total * 100)
                // }
                reader.onerror = e => {
                    this.$Message.error('文件读取出错')
                }
                reader.onload = e => {
                    this.$Message.info('文件读取成功')
                    const data = e.target.result
                    const { header, results } = excel.read(data, 'array')
                    const tableTitle = header.map(item => { return { title: item, key: item } })
                    this.tableData = results
                    console.log(this.tableData)
                    this.tableTitle = tableTitle
                    this.uploadLoading = false
                    this.tableLoading = false
                    // this.showRemoveFile = true
                }
            }
        },
        computed:{
            departments(){
                getDepts().then(res=>{
                    if(res.data.code==200){
                        return res.data.data
                    }
                }).catch(err => {
                    console.log(err)
                    this.$Message.error(err.message)
                })
            },
            cityList(){
                return [
                    {
                        value: 'New York',
                        label: 'New York'
                    },
                    {
                        value: 'London',
                        label: 'London'
                    }
                ]
            } 
        },
        created(){
            this.loadTableData()
        }
    }
</script>
<style lang="less" scoped>
.view-upload{
    display: inline-block;
}
.button-mar{
    margin-left: 20px;
}
</style>