const CheckboxComponent = ({ id, label, register }) => (
    <div className="space-x-3 text-sm">
        <input type="checkbox" className="" {...register(id)} />
        <label className="font-semibold">{label}</label>
    </div>
);

export default CheckboxComponent;
