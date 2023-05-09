
use actix::Addr;
use actix_web::{get, web::Data, web::Path, web::Payload, Error, HttpResponse, HttpRequest};
use actix_web_actors::ws;
//use uuid::Uuid;




#[get("/action/{token}")]
//#[get("/huu")]
pub async fn start_connection(
    req: HttpRequest,
    stream: Payload,
    path: Path<String>,
    srv: Data<Addr<TargetsDb>>,
) -> Result<HttpResponse, Error> {
    println!("start_connection");
    //let group_id = group_id.into_inner();
    let token = path.into_inner();
    let ws = WsConn::new(
        srv.get_ref().clone(),
    );

    let resp = ws::start(ws, &req, stream)?;
    Ok(resp)
    //Ok(HttpResponse::Ok().body("Hello world!"))
}
