var table=
{
    setEvent(table,data_fuct=null)
    {
        if(!table)return;
        var events=table.EdiTable.Const.Events;

        var FieldUpdated=null,StartEdition=null,ConfirmEdition=null,EnterCell=null,LeaveCell=null,RowAdded=null;
        if(data_fuct)
        {
            FieldUpdated=data_fuct["FieldUpdated"] ??null;
            StartEdition=data_fuct["StartEdition"] ??null;
            ConfirmEdition=data_fuct["ConfirmEdition"] ??null;
            EnterCell=data_fuct["EnterCell"] ??null;
            LeaveCell=data_fuct["LeaveCell"] ??null;
            RowAdded=data_fuct["RowAdded"] ??null;
        }
        table.Events[events.FieldUpdated]=function(e)
	    {	
            if(FieldUpdated)FieldUpdated(table,e);
	    }
	    table.Events[events.StartEdition]=function(e)
	    {	
            if(StartEdition)StartEdition(table,e);
	    }

	    table.Events[events.ConfirmEdition]=function(e)
	    {
            if(ConfirmEdition)ConfirmEdition(table,e);
	    }
	    table.Events[events.EnterCell]=function(e)
	    {
            if(EnterCell)EnterCell(table,e);
	    }
	    table.Events[events.LeaveCell]=function(e)
	    {
            if(LeaveCell)LeaveCell(table,e);
	    }

	    table.Events[events.RowAdded]=(e)=>
	    {
            if(RowAdded)RowAdded(table,e);
	    }

    }
}