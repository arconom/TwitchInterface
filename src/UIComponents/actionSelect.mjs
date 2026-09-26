const ActionSelect = {
    data() {
        return {
		    newAction: {key: "", json: ""}
        }
    },
	emits: ["actionAdded"],
	props: ["selectedActions", "availableActions"],
    watch: {
        "newAction.key"(newVal, oldVal) {
            this.newAction = {
                key: "",
                json: ""
            };
            const action = this.availableActions.find((x) => x.displayName === newVal);
            this.newAction.key = action?.displayName ?? "";
            this.newAction.json = action?.defaultJson ?? "";
        }
    },
    methods: {
		onActionAdded()
		{
			this.selectedActions.push(this.newAction);
			this.$emit("actionAdded", this.selectedActions);
		}
    },
    computed: {
        availableActionsDisplay: function () {
            return this.availableActions?.map((x) => x.displayName);
        }
    },
    mounted: function () {},
	template: `<v-row>
			<v-col>
				<v-label>Actions</v-label>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="12">
				<v-combobox :items="availableActionsDisplay" v-model="newAction.key"></v-combobox>
			</v-col>
			<v-col cols="12" sm="12">
				<v-text-field 
				label="json" 
				v-model="newAction.json"></v-text-field>
			</v-col>
			<v-col cols="1">
				<v-btn @click="selectedActions.push(newAction); newAction = {key: '', json: ''}" 
					color="primary"><v-icon icon="mdi-plus-circle"></v-icon></v-btn>
			</v-col>
		</v-row>
		<v-row v-for="(action,j) in selectedActions" :key="j">
			<v-col cols="10">
				<v-label>{{action.key}}</v-label>
			</v-col>
			<v-col cols="1">
				<v-btn @click="selectedActions?.splice(j,1)" color="error"><v-icon icon="mdi-delete"></v-icon></v-btn>
			</v-col>
			<v-col cols="12">
				<div>{{action.json}}</div>
			</v-col>
		</v-row>`
};
export default ActionSelect;
