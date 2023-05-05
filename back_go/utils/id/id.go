package id

import "go.mongodb.org/mongo-driver/bson/primitive"

func GenerateId() primitive.ObjectID {
	return primitive.NewObjectID()
}

func IdFromString(id string) primitive.ObjectID {
	idPrimitive, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return primitive.ObjectID{}
	}
	return idPrimitive
}
