document.addEventListener("DOMContentLoaded",()=>{mov.init();});

var mov=
{
    init()
    {
        this.btn_confirmar=document.getElementById("btn_add_entity_confirmar");
        this.table_cuentas=document.getElementById("table_cuentas");

        this.fecha_aplicacion=document.getElementById("fecha_aplicacion");
        this.check_confirmar=document.getElementById("check_confirmar");
        this.notas=document.getElementById("notas");
        this.check_conciliar=document.getElementById("check_conciliar");
        this.check_auditar=document.getElementById("check_auditar");
        this.notas=document.getElementById("notas");
        this.media_list=document.getElementById("media-list");

        this.adjuntos=document.getElementById("adjuntos");

        if(this.btn_confirmar)this.btn_confirmar.addEventListener("click",
        ()=>
        {
            var data=mov.DataRowSelected();
            if(!data)return;
            
            data["aplicacion"]=this.fecha_aplicacion.value;
            data["confirmado"]=this.check_confirmar.checked;
            data["conciliado"]=this.check_conciliar.checked;
            data["auditado"]=this.check_auditar.checked;
            data["notas"]=this.notas?.value??"";
            
            mov.service(mov.url_mov_cuenta,data,"confirmar");
        });

        this.table_cuentas.onTdPaint =(td,row,col,field)=>
        {
            var data=mov.table_cuentas.DataArray[row];
            if(data && (data.confirmado??false) && field=="btn_confirmado")
            {
                td.style.backgroundColor = '#28a745';
                td.style.color = '#FFF';
            }
        }

        if(this.adjuntos)this.adjuntos.addEventListener("change",
        ()=>
        {
            if(this.adjuntos.value.trim()=="")return;

            var data=mov.DataRowSelected();
            if(!data)return;

            mov.upload(this.adjuntos,"#lbl_entity_blank_",data,"upload");
        });

        this.media_list.onClicking=data=>
        {
            mov.SelectedElement(data);
        }
    },
    data_preview:null,
    SelectedElement(data)
	{
		this.data_preview=mov.getDataById(data.__internal_id__);
	},
    getDataById(id)
	{
		var data= this.media_list.getData(false).find(e=>e.__internal_id__==id);
		data["index"]= this.media_list.getData(false).findIndex(e=>e.__internal_id__==id);
		return data;
	},
    preview()
	{
		var data=this.data_preview;
		if(!data)
		{
			alert("Debe seleccionar un elemento");
			return;
		}
		
		window.open(data.url,"_blank");
	},
    DataRowSelected()
    {
        if(!this.table_cuentas)return;

        var row=this.table_cuentas.CurrentRowIndex();
        if(row<0)
        {
            alert("Debe seleccionar una fila de la tabla");
            return;
        }
        return this.table_cuentas.DataArray[row];
    },
    changeCheck(data,act,event=null)
    {
        var fact="conciliar";
        switch (act)
        {
            case 1:
                fact="auditar";
                break;
            case 99:
                fact="cancelar"
                break
        }
        if(event)data["active"]=event.target.checked
  
        mov.service(mov.url_mov_cuenta,data,fact);
    },
    upload(file,idalertmodal,fdata=null,act="",_field_="")
    {
        if(!file)return;
        if(file.value.trim()=="")return;

        var data=new FormData();
        for(let i=0;i<file.files.length;i++)
        {
            var f=file.files[i];
            data.append(f.name,f);
        }
        if(fdata)
        {
            for(var key in fdata) 
            {
                data.append(key,fdata[key]);
            }
        }

        if(act.trim()!="")data.append("act",act);
        if(_field_.trim()!="")data.append("_field_",_field_);

        InduxsoftCrudlModel.InvokeService(mov.url_mov_cuenta,data,
        function(data)
        {
            file.value="";
            mov.alerText(idalertmodal,"Archivo subido correctamente","color:green");
        },
        function(error)
        {
            file.value="";
            mov.alerText(idalertmodal,error.message ?? error);
        },"POST",false,true,"",true);
    },
    alerText:function(idelem,text="",css="",time=4000)
	{
		if(idelem.trim()=="")return;
		var elm=document.querySelector(idelem);
		if(!elm)return;

		var _before_css=elm.style.cssText;

		elm.innerHTML=text;
		if(css!="")elm.style.cssText=css;

		setTimeout(function()
		{
			elm.innerHTML="";
			elm.style.cssText=_before_css;
		}, time);
	},
    service(url,data,act,callback_success=null,callback_failed=null)
    {
        if(!data)data={};

        data["act"]=act;

        InduxsoftCrudlModel.InvokeService(url,data,
	    function(data)
	    {
            if(callback_success)callback_success(data);
            else window.location.reload();
	    	
	    },
	    function(error)
	    {
	    	if(callback_failed)callback_failed(error);
            else alert(error.message??error);
	    },"POST",false);
    },
    MovCuentaModal(row)
    {
        if(this.fecha_aplicacion)this.fecha_aplicacion.value=row.aplicacion??"";
        if(this.check_confirmar)this.check_confirmar.checked=(row.confirmado??0)>0;
        if(this.check_conciliar)this.check_conciliar.checked=(row.conciliado??0)>0;
        if(this.check_auditar)this.check_auditar.checked=(row.auditado??0)>0;
        
        mov.service(mov.url_mov_cuenta,row,"getadjuntos",
        (data)=>
        {
            console.log(data);
            mov.media_list.setData(data);
        },(error)=>{});
        this.showModal("modal_entity_mov_cuenta");
    },
    showModal(modalId='')
    {
        this.getBSModal(modalId).show();
    },
    hideModal(modalId='')
    {
        this.getBSModal(modalId).hide();
    },
    getBSModal(modalId='')
    {
        if(modalId.trim()=="")return;

        const modalElement = document.getElementById(modalId);

        if(!modalElement)
        {
            console.log("Elemento no definido");
            return;
        }
        const bsModal = bootstrap.Modal.getInstance(modalElement);
        if (!bsModal) return new bootstrap.Modal(modalElement);

        return bsModal;
    }
}