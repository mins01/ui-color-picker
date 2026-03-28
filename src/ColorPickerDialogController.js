export default class ColorPickerDialogController {
    dialog=null;
    matchesStyle=null;
    constructor(dialog) {
        this.dialog = dialog;
    }

    addColorPickerInterceptor(interceptorTarget=window,matchesStyle='.open-color-picker-dialog'){
        this.interceptorTarget = interceptorTarget;
        this.matchesStyle = matchesStyle;
        this.interceptorTarget.addEventListener('click',this.handleClick)
    }
    removeColorPickerInterceptor(){
        this.interceptorTarget.removeEventListener('click',this.handleClick)
    }
    handleClick = (event)=>{
        if(!event.target.matches(this.matchesStyle)){return}
        // event.stopPropagation();
        event.preventDefault();

        this.openColorPickerDialog(event.target).then((value)=>{
            console.log(value);
            if(event.target.value != value){
                event.target.value = value;
                event.target.dispatchEvent(new Event('change'));
            }
        });
    }
    openColorPickerDialog(target){
        const dialog = this.dialog;
        const picker = dialog.querySelector('ui-color-picker');
        return new Promise((resolve,reject)=>{
            if (!dialog) return reject(new Error('Dialog not found'));
            const handleClose = ()=>{
                dialog.close();
                dialog.removeEventListener('confirm-color-picker', handleConfirm)
                dialog.removeEventListener('cancel-color-picker', handleConfirm)
            }
            const handleConfirm = (event)=>{
                handleClose();
                resolve(picker.toString(target.dataset.toStringType ?? 'hex'));
            }
            
            try{
                dialog.querySelector('ui-color-picker').value = target.value;
                dialog.showModal();
                dialog.focus();
                requestAnimationFrame(() => {
                    dialog.focus();
                })
                dialog.addEventListener('confirm-color-picker', handleConfirm)
                dialog.addEventListener('cancel-color-picker', handleConfirm)
            }catch(e){
                handleClose();
                reject(e);
            }
        })
    }
}
