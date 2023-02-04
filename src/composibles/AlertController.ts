import type { VAlert } from "vuetify/components/VAlert";
import type { Ref } from "vue";
import { ref } from "vue";

type AlertState = {
    type: VAlert["type"];
    text: string;
    show: boolean;
    closable: boolean;
};

export class AlertController {
    #state: Ref<AlertState>;

    constructor() {
        this.#state = ref<AlertState>({
            type: "info",
            text: "",
            show: false,
            closable: false
        });
    }

    get state(): AlertState {
        return this.#state.value;
    }

    error(text: string) {
        this.#state.value.type = "error";
        this.#state.value.text = text;
    }

    warning(text: string) {
        this.#state.value.type = "warning";
        this.#state.value.text = text;
    }

    success(text: string) {
        this.#state.value.type = "success";
        this.#state.value.text = text;
    }

    info(text: string) {
        this.#state.value.type = "info";
        this.#state.value.text = text;
    }

    show(persistent: boolean = false) {
        this.#state.value.closable = !persistent;
        this.#state.value.show = true;
    }

    close() {
        this.#state.value.show = false;
    }
}
