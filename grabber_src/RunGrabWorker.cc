#include "GrabWorker.h"
#include <iostream>

GrabWorker* asyncWorker;

Value cancel(const CallbackInfo& info) {
    asyncWorker->StopWorking();
    return info.Env().Undefined();
};

Value run(const CallbackInfo& info) {
    int feedsNumber = info[0].As<Number>();
    std::string videoSourcePath = info[1].As<String>();
    Function callback = info[2].As<Function>();
    asyncWorker = new GrabWorker(callback, videoSourcePath, feedsNumber);
    asyncWorker->Queue();
    std::string msg = "";


    Object obj = Object::New(info.Env());

    obj.Set("cancel", Function::New<cancel>(info.Env()));

    return obj;
};


Object Init(Env env, Object exports) {
    exports["run"] = Function::New(env, run, std::string("run"));
    return exports;
}

NODE_API_MODULE(addon, Init)
