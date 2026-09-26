import DataAccess from "../dataAccess.mjs";
import EventSubscription from "../eventSubscription.mjs";
import ActionSelect from "./actionSelect.mjs";
const dataAccess = new DataAccess();

const EventSubscriptionDetail = {
	components:{ActionSelect},
    data() {
        return {
            model: new EventSubscription(),
			eventSubscriptionTypes: new Map()
        }
    },
    props: ["availableActions", "modelValue", "moderatorId"],
    watch: {
		modelValue(newValue, oldValue)
		{
			console.log("eventSubscriptionDetail", this.newValue);
			this.model = new EventSubscription(newValue);
		}
	},
    methods: {
		setName(e)
		{
			console.log("model.name", e);
			console.log("this.eventSubscriptionTypes", this.eventSubscriptionTypes);
            this.model = new EventSubscription(this.eventSubscriptionTypes.get(e));
			this.model.key = e;
			this.model.name = e;
		},
		addAction(action)
		{
			this.model.actions.push(action);
			console.log("actions", this.actions);
		},
		close_onClick()
		{
			console.log("close_onClick", this.model);
			this.$emit("update:modelValue", this.model);
			this.$emit("close");
		}
	},
    computed: {
        eventSubscriptionTypesDisplay: function () {
            return Array.from(this.eventSubscriptionTypes.entries())
            .map(function (x, i) {
                return {
                    name: x[0],
                    value: x[1].name
                };
            });
        },
    },
    mounted: function () {
		let self = this;
		console.log("esd.mount model", self.modelValue);
        self.model = new EventSubscription(self.modelValue);
        
		dataAccess.getSubscriptionTypes()
        .then(function (data) {
            var temp = new Map();
            if (data?.length > 0) {
                data.forEach(function (x) {
					// console.log("data", x);
                    if (x[1].condition.hasOwnProperty("moderator_user_id")) {
                        x[1].condition["moderator_user_id"] = self.moderatorId;
                    }

                    temp.set(x[0], x[1]);
                });
            }
			// console.log();
            self.eventSubscriptionTypes = temp;
        })
        .catch(function (err) {
            console.log(err);
        });

    },
    template: `<v-card>
		<v-card-title>
			<v-row>
				<v-col cols="10">
					Event Subscription
				</v-col>
				<v-col cols="1">
					<v-btn
					  @click.stop.prev="close_onClick"
					  color="success"
					><v-icon icon="mdi-content-save"/></v-btn>
				</v-col>
			</v-row>
		</v-card-title>
		<v-card-subtitle></v-card-subtitle>
		<v-card-text>
			<v-select :model-value="model.key"
				@update:model-value="setName"
				:items="eventSubscriptionTypesDisplay"
				item-title="name"
				item-value="name"
			>
			</v-select>
				
			<v-row v-for="(item, i) in Object.keys(model.condition)" 
				:key="i">
				<v-text-field 
				:label="item" 
				v-model="model.condition[item]"></v-text-field>
			</v-row>
		
			<action-select 
				@actionAdded="addAction"
				:selected-actions="model.actions"
				:available-actions="availableActions"
			>
			</action-select>

			<!-- <v-btn @click="removeActionFromEventSubscription(item.name, j)"  -->
				<!-- color="error"><v-icon icon="mdi-delete"></v-icon></v-btn> -->
			<!-- <v-col cols="1"> -->
				<!-- <v-btn @click="addActionToEventSubscription(item.name, item.subKey)" color="primary">+</v-btn> -->
			<!-- </v-col> -->

		</v-card-text>
	</v-card>`
};
export default EventSubscriptionDetail;
