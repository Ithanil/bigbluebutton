package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext.Implicits.global

object DatabaseConnection {
  val db = Database.forConfig("postgres")
  //  implicit val session: Session = db.createSession()
}
