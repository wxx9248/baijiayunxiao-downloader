import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";

createApp(App)
    .use(vuetify)
    .mount(
        (() => {
            const app = document.createElement("div");
            document.body.append(app);
            return app;
        })()
    );
