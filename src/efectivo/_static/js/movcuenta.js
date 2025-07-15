var mov=
{
    tableId:"",

    init()
    {
        this.table_cuentas=document.getElementById(this.tableId);
        this.btn_confirmar=document.getElementById("btn_add_entity_confirmar");

        this.fecha_aplicacion=document.getElementById("fecha_aplicacion");
        this.check_confirmar=document.getElementById("check_confirmar");
        this.notas=document.getElementById("notas");
        this.check_conciliar=document.getElementById("check_conciliar");
        this.check_auditar=document.getElementById("check_auditar");
        this.notas=document.getElementById("notas");
        this.media_list=document.getElementById("media-list");

        this.adjuntos=document.getElementById("adjuntos");
        this.form_filter=document.getElementById("form_filter");
        
        if(this.form_filter)
        {
            var fields=this.form_filter.querySelectorAll("select");
            if(fields)
            {
                for (let i = 0; i < fields.length; i++) 
                {
                    const elm = fields[i];
                    if(elm)elm.addEventListener("change",()=>{document.querySelector('#form_filter').submit();})
                }
            }
        }

        if(this.btn_confirmar)this.btn_confirmar.addEventListener("click", () => {
            var data=mov.DataRowSelected();
            if(!data)return;
            
            data["aplicacion"] = this.fecha_aplicacion.value;
            data["confirmado"] = this.check_confirmar.checked;
            data["conciliado"] = this.check_conciliar.checked;
            data["auditado"] = this.check_auditar.checked;
            data["fconfirmado"] = (this.check_confirmar.checked) ? "Sí" : "No";
            data["notas"] = this.notas?.value??"";
            
            mov.service(mov.url_mov_cuenta,data,"confirmar",
            (result)=>
            {
                data.sys_recver = result.sys_recver_mov + 1;
                data.notas_mc = result.notas??"";
                
                mov.changeValueData(data);
                mov.hideModal("modal_entity_mov_cuenta");
                // window.location.reload();
            });
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

        if(this.adjuntos)this.adjuntos.addEventListener("change", () => {
            if(this.adjuntos.value.trim()=="")return;

            var data=mov.DataRowSelected();
            if(!data)return;

            mov.upload(this.adjuntos,"#lbl_entity_blank_",data,"upload");
        });

        this.media_list.onClicking=data=>
        {
            mov.SelectedElement(data);
        }

        if(this.check_confirmar)this.check_confirmar.addEventListener("change",()=>
        {   
            if(!this.check_confirmar.checked)
            {
                this.notas.value="";
                this.notas.setAttribute("disabled",true);
            }
            else{this.notas.removeAttribute("disabled");}
        });
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
		let data = this.data_preview;
		if(!data)
		{
			alert("Debe seleccionar un elemento");
			return;
		}

        let url = InduxsoftCrudlModel.UrlAddParameter(data.url,"act","dwn-adjunto");
        // window.location.href = url;
        window.open(url,"_blank");
	},
    remover()
    {
        let item = this.data_preview;
		if(!item)
		{
			alert("Debe seleccionar un elemento");
			return;
		}

        let url = InduxsoftCrudlModel.UrlAddParameter(item.url,"act","del-adjunto");
        fetch(url).then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                return
            }
            this.media_list.removeMediaByIndex(item.index);
        })
        .catch(error => { alert(error.message ?? JSON.stringify(error)) })
    },
    delete()
    {
        const sys_pk = this.table_cuentas?.DataArray[this.table_cuentas?.CurrentRowIndex()]?.sys_pk || 0;
        if (sys_pk < 1 || this.req_delete_mov) return;
        if (!confirm("¿Esta seguro de eliminar el movimiento seleccionado?")) return;
        this.req_delete_mov = true;

        const onSuccess = (response) => {
            alert("¡El movimiento se ha eliminado!");
            window.location.reload();
        }

        const onFailure = (failure) => {
            if (failure.message) alert(failure.message);
            else console.error(failure);
            this.req_delete_mov = false;
        }

        let endpoint = "/!/efectivo/movcuenta/"+sys_pk+"/movimientos/";
        InduxsoftCrudlModel.InvokeService(endpoint,null,onSuccess,onFailure,"DELETE",false,false);
    },
    DataRowSelected(msg=true)
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
    changeValueData(row)
    {
        let index = row._index_;
        let tr = mov.table_cuentas.GetTrByIndex(index);
        let fields = tr.querySelectorAll('input[type="checkbox"]');
        
        for (let i = 0; i < fields.length; i++) 
        {
            var elm = fields[i];
            if(elm)
            {
                if (elm.id === "check_conciliado_"+index) {
                    (row.conciliado) ? elm.setAttribute("checked",true) : elm.removeAttribute("checked");
                    row["fconciliado"] = elm.outerHTML;
                }
                if (elm.id === "check_auditado_"+index) {
                    (row.auditado) ? elm.setAttribute("checked",true) : elm.removeAttribute("checked");
                    row["fauditado"] = elm.outerHTML;
                }
            }
        }

        mov.UpdateRow(row,index);
    },
    CancelRow(data=null)
    {
        if(!data)data=mov.DataRowSelected();
         
        if(!data)return;

        data["fconciliado"]="No";
        data["fcancelado"]="Sí";
        data["fauditado"]="No";

        if(data.conciliado??false)data["fconciliado"]="Sí";
        if(data.cancelado??false)data["fcancelado"]="Sí";
        if(data.auditado??false)data["fauditado"]="Sí";

        data["btn_confirmado"]="";
        var index=Number(data["_index_"]??0);
        mov.UpdateRow(data,index);
    },
    UpdateRow(data,index)
    {
        mov.table_cuentas.DataArray[index]=data;
        mov.table_cuentas.UpdateRow(index)
    },
    getFieldFormFilter()
    {
        var filters=this.form_filter.querySelectorAll("input,select");

        var filter={}
        for (let i = 0; i < filters.length; i++) 
        {
            const elm = filters[i];
            if(elm)
            {
                if(elm.type=="checkbox")
                {
                    if(elm.checked)filter[elm.name]=elm.checked;
                }
                else{filter[elm.name]=elm.value;}
                
            }
        }
        return filter;
    },
    changeCheck(irow,act,checkbox)
    {
        let data = this.table_cuentas.DataArray[irow];
        let active = (checkbox) ? checkbox.checked : false;
        
        let fact = "";
        switch (act)
        {
            case 0:
                fact = "conciliar";
                data["conciliado"] = active;
                break
            case 1:
                fact = "auditar";
                data["auditado"] = active;
                break
            case 99:
                fact = "cancelar";
                data["cancelado"] = true;
                break
            default:
                console.warn("Acción no implementada");
            break;
        }
        
        if (fact == "") return;
        if (fact == "cancelar" && !confirm("¿Esta seguro que desea cancelar: "+data.referencia+"?")) return;

        data["_entity_id"] = mov._entity_id??0;
        data["active"] = active;
        if(act==99) data["params"] = mov.getFieldFormFilter();

        mov.service(mov.url_mov_cuenta,data,fact,
        (result) => {
            data.sys_recver = result.sys_recver + 1;

            if (act!=99) mov.changeValueData(data);
            if (act==99) {
                mov.CancelRow(data);
                mov.setValueSaldos(result)
            }
        });
    },
    setValueSaldos(result)
    {
        var saldos=result.data_cuenta.saldos;
        
        var saldo_inicial=document.getElementById("saldo_inicial");
        var ingresos=document.getElementById("ingresos");
        var egresos=document.getElementById("egresos");
        var saldo_alfinal=document.getElementById("saldo_alfinal");
        var saldo_total=document.getElementById("saldo_total");

        if(saldo_inicial)saldo_inicial.innerHTML=saldos.saldo_inicial;
        if(ingresos)ingresos.innerHTML=saldos.ingresos;
        if(egresos)egresos.innerHTML=saldos.egresos;
        if(saldo_alfinal)saldo_alfinal.innerHTML=saldos.saldo_alfinal;
        if(saldo_total)saldo_total.innerHTML=saldos.saldo_total;
    },
    upload(file,idalertmodal,fdata=null,act="",_field_="")
    {
        if(!file)return;
        if(file.value.trim()=="")return;

        var data = new FormData();

        if(act.trim()!="")data.append("act",act);
        if(_field_.trim()!="")data.append("_field_",_field_);
        
        if(fdata)
        {
            data.append("cta",fdata["cta"]);
            data.append("mov",fdata["mov"]);
            // for(var key in fdata) 
            // {
            //     data.append(key,fdata[key]);
            // }
        }

        for(let i=0;i<file.files.length;i++)
        {
            var f=file.files[i];
            data.append(f.name,f);
        }

        InduxsoftCrudlModel.InvokeService(mov.url_mov_cuenta,data,
        function(data)
        {
            var row=mov.DataRowSelected();
            if(row)mov.getAdjuntos(row);
            
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
    MovCuentaModal(irow)
    {
        let row = this.table_cuentas.DataArray[irow];

        if(this.fecha_aplicacion)this.fecha_aplicacion.value=row.aplicacion??"";
        if(this.check_confirmar)this.check_confirmar.checked=(row.confirmado??0)>0;
        if(this.check_conciliar)this.check_conciliar.checked=(row.conciliado??0)>0;
        if(this.check_auditar)this.check_auditar.checked=(row.auditado??0)>0;
        if(this.notas)this.notas.value=(row.notas_mc??"");

        var nav=document.getElementById("nav-principal-tab");
        if(nav)nav.click();

        this.getAdjuntos(row);
        this.trigger(this.check_confirmar,"change");
        this.showModal("modal_entity_mov_cuenta");
    },
    getAdjuntos(row)
    {
        mov.service(mov.url_mov_cuenta,row,"getadjuntos",
        (data)=>
        {
            mov.media_list.setData(data);
        },(error)=>
        {
            mov.alerText("#lbl_entity_blank_",error.message??error,"color:red");
        });
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
    },
    trigger:function(element,event)
	{
		var e=new Event(event);
       if(element)element.dispatchEvent(e);
	}
}